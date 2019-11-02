import api from '@src/libs/api';
import editor from '@src/store/editor';
import { Autocomplete, Dialog, Text } from 'evergreen-ui';
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef } from 'react';
import AutosizeInput from 'react-input-autosize';
import { parseValue } from './utility/parser/parser';
import _ from "lodash";

const onCloseDialog = () => {
    if (document.activeElement) {
        (document.activeElement as any).blur();
    }
    meta.closing = true;
    editor.modals.expression = false;
    setTimeout(() => {
        meta.shouldFocusFirst = false;
        setTimeout(() => {
            meta.closing = false;
        });
    });
}
const meta = observable({
    title: 'Please type an expression',
    pre: '',
    post: '',
    footer: '',
    definitions: {} as any,
    suggestions: [] as string[],
    closing: false,
    text: [""],
    shouldFocusFirst: false,
});
const regex = /[^\w.\"\'\`\s]+/ig;

const generateSuggestions = (value: string) => {
    let path: string[] = [];
    let result = [] as any;

    const walk = (object: any, parent: string[]) => {
        if (typeof object === "object" && !Array.isArray(object)) {
            for (let i in object) {
                result.push([...parent, i].join('.'));
                walk(object[i], [...parent, i]);
            }
        }
    }

    walk(value, []);
    return result;
}

export default observer(() => {
    const openMenuRefs = useRef({} as any);
    const firstRef = useRef(null as any);

    useEffect(() => {
        if (meta.shouldFocusFirst) {
            const finish = () => {
                meta.shouldFocusFirst = false;
                firstRef.current.focus();
            }
            const iv = setInterval(() => {
                if (firstRef && firstRef.current) {
                    finish();
                }
                clearInterval(iv);
            }, 100);
        }
    }, [meta.shouldFocusFirst])

    return <Dialog isShown={editor.modals.expression}
        hasHeader={false}
        hasFooter={false}
        preventBodyScrolling
        overlayProps={{
            onClick: () => {
                onCloseDialog();
            }
        }}
        shouldCloseOnOverlayClick={false}
        minHeightContent={55}
        width={400}>
        <div className="expr-dialog" onClickCapture={(e: any) => {
            e.stopPropagation();
        }}>
            {meta.title && <Text style={{ marginBottom: '5px' }}>
                {meta.title}
            </Text>}
            <div className="content">
                {meta.pre && <Text style={{ marginRight: '3px', whiteSpace: 'pre-wrap' }}>
                    {meta.pre}
                </Text>}
                {meta.text.map((item, key: number) => {
                    const onSelect = (changedItem: any) => {
                        meta.text[key] = changedItem;
                    }
                    return <ExpInput inputRef={key === 0 ? firstRef : undefined}
                        onSelect={onSelect}
                        key={key}
                        idx={key}
                        isLast={key === meta.text.length - 1}
                        openMenuRefs={openMenuRefs} item={item} />
                })
                }
                {meta.post && <Text style={{ marginLeft: '3px', whiteSpace: 'pre-wrap' }}>
                    {meta.post}
                </Text>}
            </div>
            {meta.footer && <Text size={300} style={{ whiteSpace: 'pre-wrap', margin: '5px 0px 5px 5px', fontSize: '12px' }}>
                {meta.footer}
            </Text>
            }
        </div>
    </Dialog>
})

export const evalExpressionInObj = async (obj: any, opt = {
    useCache: false,
    local: true
}) => {
    const res = {} as any;
    Object.keys(obj).map(async (o, idx) => {
        res[o] = await evalExpression(obj[o], idx === 0 ? opt : {
            ...opt,
            useCache: true
        });
    })
    return res;
}

export const evalExpression = async (expr: string, opt = {
    useCache: false,
    local: true
}) => {
    if (!opt.useCache || Object.keys(meta.definitions).length === 0) {
        let path = editor.current && opt.local ? `?path=${editor.current.path}` : '';
        meta.definitions = await api.get(`store/definition${path}`);
    }
    const str = [];

    let result = null;
    Object.keys(meta.definitions).map((r: string) => {
        str.push(`const ${r} = ${JSON.stringify(parseValue(meta.definitions[r]))}`);
    })


    let v = expr;
    if (isQuote(v[0]) && isQuote(v[v.length - 1])) {
        const vp = v.replace(new RegExp(`\\\\${v[0]}`, "g"), v[0]).split(v[0])
        vp.pop();
        vp.shift();
        v = `${v[0]}${vp.join("\\" + v[0])}${v[0]}`
    }

    str.push(`result = ${v}`);
    try {
        eval(str.join("\n"));
    } catch {
        console.log(str.join("\n"))
    }
    return result;
}

export const promptExpression = (options?: {
    title?: string,
    pre?: string,
    post?: string,
    footer?: string,
    value?: string,
    returnExp?: boolean,
    local?: boolean,
    wrapExp?: string
}): Promise<any> => {
    meta.text = [];
    const opt = options || {};
    setTimeout(async () => {
        if (editor.current) {
            const path = opt.local === false ? '' : `?path=${editor.current.path}`;
            const res = await api.get(`store/definition${path}`);
            meta.definitions = {};
            Object.keys(res).map((r: string) => {
                meta.definitions[r] = parseValue(res[r]);
            })
            meta.suggestions = generateSuggestions(meta.definitions);
        }
    });

    return new Promise((resolve) => {
        if (editor.modals.expression) {
            onCloseDialog();
            setTimeout(async () => {
                resolve(await promptExpression(options));
            }, 100);
            return;
        }

        editor.modals.expression = true;
        meta.shouldFocusFirst = true;
        meta.title = opt.title || "";
        meta.pre = opt.pre || "";
        meta.post = opt.post || "";
        meta.footer = opt.footer || "";

        meta.text = [];
        const sqval = splitStringByQuote(opt.value || "");
        sqval.map(
            (e: string) => {
                if (isQuote(e[0])) {
                    meta.text.push(e)
                } else {
                    e.split(" ").map((d: string) => {
                        const se = splitExp(d);
                        if (se.length === 0 && !!d) {
                            meta.text.push(d);
                        } else {
                            se.map(
                                (f: string) => meta.text.push(f)
                            )
                        }
                    })
                }
            }
        );

        if (meta.text.length === 0) { meta.text = [""] }

        const finish = async () => {
            let text = meta.text.join("");
            if (text.trim().length > 0) {
                if (opt.wrapExp) {
                    text = opt.wrapExp.replace('[[value]]', text);
                }

                if (!opt.returnExp) {
                    resolve(text);
                } else {
                    const res = await api.post("morph/parse-exp", { value: text });
                    resolve({ expression: res, imports: [] })
                }
            } else {
                resolve("");
            }
            meta.text = [""];
        }

        const iv = setInterval(() => {
            if (!editor.modals.expression) {
                clearInterval(iv);
                finish();
            }
        }, 500)
    });
}

const ExpInput = observer(({ onSelect, idx, openMenuRefs, item, inputRef, isLast }: any) => {
    const key = idx;
    return <Autocomplete
        onChange={onSelect}
        onSelect={onSelect}
        items={meta.suggestions}
        children={(props: any) => {
            const { getInputProps, getRef, openMenu, isShown } = props
            openMenuRefs.current[idx] = openMenu;
            return (
                <AutosizeInput
                    ref={inputRef}
                    inputRef={getRef}
                    className={`input ${isLast ? 'last' : ''}`}
                    spellCheck={false}
                    {...getInputProps({
                        onFocus: (e: any) => {
                            const val = e.target.value.match(regex);
                            if (!val || !!val && val.length === 0) {
                                if (!meta.closing)
                                    openMenu();
                            }
                        },
                        value: item || "",
                        onBlur: (e: any) => {
                            const val = e.target.value;
                            if (val === "" && meta.text.length > 1) {
                                meta.text.splice(key, 1);
                            }
                        },
                        onKeyDown: (e: any) => {
                            if (e.target.value === "") {
                                if (e.which === 8 || e.which === 46) {
                                    if (meta.text.length > 1) {
                                        meta.text.splice(key, 1);

                                        const target = e.target;
                                        const sibling = target.parentNode.parentNode.previousSibling;
                                        setTimeout(() => {
                                            if (sibling) {
                                                const node = _.get(sibling, `childNodes.0.childNodes.0`);
                                                if (node) node.focus()
                                            }
                                        })
                                    }
                                }

                            }
                            if (e.which === 9) {
                                e.preventDefault();
                                if (e.target.value !== "") {
                                    meta.text.push("");

                                    const target = e.target;
                                    setTimeout(() => {
                                        const sibling = target.parentNode.parentNode.nextSibling;
                                        if (sibling) {
                                            const node = _.get(sibling, `childNodes.0.childNodes.0`);
                                            if (node) node.focus()
                                        }
                                    })
                                }
                            }

                            if (e.which === 37) {
                                const target = e.target;
                                if (e.target.selectionStart === 0) {
                                    setTimeout(() => {
                                        const sibling = target.parentNode.parentNode.previousSibling;
                                        if (sibling) {
                                            const node = _.get(sibling, `childNodes.0.childNodes.0`);
                                            if (node) node.focus()
                                        }
                                    })
                                }
                            }
                            if (e.which === 39) {
                                const target = e.target;
                                if (e.target.selectionStart === e.target.value.length) {
                                    setTimeout(() => {
                                        const sibling = target.parentNode.parentNode.nextSibling;
                                        if (sibling) {
                                            const node = _.get(sibling, `childNodes.0.childNodes.0`);
                                            if (node) node.focus()
                                        }
                                    })
                                }
                            }
                            if (e.which === 13) {
                                if (!isShown || props.highlightedIndex === -1) {
                                    onCloseDialog();
                                }
                            }
                        },
                        onChange: (e: any) => {
                            const val = e.target.value;
                            const res = splitExp(val);

                            if (res.length > 0) {
                                const length = meta.text.length
                                meta.text.splice(key || 0, 1, ...res);

                                const target = e.target;
                                setTimeout(() => {
                                    if (length !== meta.text.length) {
                                        let sibling = target.parentNode.parentNode.nextSibling;

                                        if (target.selectionStart < val.length / 2) {
                                            sibling = target.parentNode.parentNode.previousSibling;
                                        }
                                        if (sibling) {
                                            const node = _.get(sibling, `childNodes.0.childNodes.0`);
                                            if (node) node.focus()
                                        }
                                    }
                                })
                            } else {
                                meta.text[key] = val;
                            }
                        },
                    })}
                />
            )
        }}
    />
})


export const isQuote = (v: string) => {
    return (v === '"' || v === '`' || v === "'")
}

const splitStringByQuote = (val: string): string[] => {
    let quote = null;
    const result = [] as string[];
    let idx = 0;
    let qidx = 0;
    for (let i in val as any) {
        const v = val[i as any];

        if (quote === null && isQuote(v)) { quote = v; }
        if (v === quote) {
            idx++;
            qidx++;
            if (qidx === 2) {
                qidx = 0;
                idx--;
                quote == null;
            }
        }
        result[idx] = (result[idx] || "") + v;

    }
    return result;
}
const splitExp = (val: string): string[] => {
    if (isQuote(val[0])) {
        const c = val[0];
        const result = [] as string[];
        let idx = 0;
        let qidx = 0;
        for (let i in val as any) {
            const v = val[i as any];
            result[idx] = (result[idx] || "") + v;
            if (v === c) {
                qidx++;
            }

            if (qidx === 2) { idx++; qidx = 0 }

        }
        return result;
    }
    const split = val.split(regex);
    const match = val.match(regex);

    if (match && match.length > 0) {
        const result = [] as string[];
        split.map((s: string, idx: number) => {
            if (match && match.length > 0) {
                const p = match.pop();
                if (s === "" && idx === 0) {
                    if (p)
                        result.push(p);
                } else {
                    result.push(s);
                    if (p)
                        result.push(p);
                }
            } else {
                result.push(s)
            }
        })
        if (result.length > 0) {
            const res = result.filter(e => !!e);
            return res;
        }
    }
    return [];
}