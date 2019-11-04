import { fontFamily } from '@src/App';
import api from '@src/libs/api';
import editor from '@src/store/editor';
import { Autocomplete, Dialog, Text } from 'evergreen-ui';
import _ from "lodash";
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef } from 'react';
import AutosizeInput from 'react-input-autosize';
import { parseValue } from './utility/parser/parser';

const MDialog = Dialog as any;
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
                    clearInterval(iv);
                }
            }, 100);
        }
    }, [meta.shouldFocusFirst])

    return <MDialog isShown={editor.modals.expression}
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
            <div style={{ fontFamily: fontFamily, fontSize: 10, color: '#999', marginTop: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', lineHeight: '15px' }}>
                Press
                <span style={{ borderRadius: 3, fontSize: 8, fontWeight: 'bold', border: '1px solid #ccc', padding: '0px 2px', margin: '0px 3px' }}>TAB</span>
                to add next,
                and
                <span style={{ borderRadius: 3, fontSize: 8, fontWeight: 'bold', border: '1px solid #ccc', padding: '0px 2px', margin: '0px 3px' }}>Shift + TAB</span>
                to add previous
                </div>
        </div>
    </MDialog>
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
    returnImport?: boolean
    local?: boolean,
    async?: boolean,
    wrapExp?: string
}): Promise<{
    expression: any,
    imports: any
}> => {
    meta.text = [];
    const opt = {
        ...{
            title: "",
            pre: "",
            post: "",
            footer: "",
            value: "",
            wrapExp: "",
            async: false,
            returnImport: true,
            returnExp: false,
            local: false
        }, ...options
    };

    setTimeout(async () => {
        if (editor.current) {
            const params = [];
            if (opt.local === true) params.push(`path=${editor.current.path}`);
            if (opt.async === true) params.push(`async=true`);

            const res = await api.get(`store/definition${params.length > 0 ? '?' : ''}${params.join("&")}`);
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

        meta.text = splitExp(opt.value || "");
        // splitStringByAwaitApi(opt.value || "").map(ea => {
        //     if (ea.indexOf("await api") === 0) {
        //         meta.text.push(ea)
        //     } else {
        //         splitStringByQuote(ea).map(
        //             (e: string) => {
        //                 if (isQuote(e[0])) {
        //                     meta.text.push(e)
        //                 } else {
        //                     e.split(" ").map((d: string) => {
        //                         const se = splitExp(d);
        //                         if (se.length === 0 && !!d) {
        //                             meta.text.push(d);
        //                         } else {
        //                             se.map(
        //                                 (f: string) => {
        //                                     if (!!f) meta.text.push(f)
        //                                 }
        //                             )
        //                         }
        //                     })
        //                 }
        //             }
        //         )
        //     }
        // });

        const finish = async () => {
            const defs = Object.keys(meta.definitions);
            const imports = {} as any;
            meta.text.map((t: string) => {
                if (t.indexOf("await api") >= 0) {
                    imports["api"] = {
                        from: `@src/api`,
                        type: 'default'
                    }
                } else {
                    const ts = t.split(".");
                    if (ts.length > 0 && defs.indexOf(ts[0]) >= 0) {
                        imports[ts[0]] = {
                            from: `@src/stores/${ts[0]}`,
                            type: 'default'
                        }
                    }
                }
            });


            let text = meta.text.join("");
            if (text.trim().length > 0) {
                if (opt.wrapExp) {
                    text = opt.wrapExp.replace('[[value]]', text);
                }

                if (!opt.returnExp) {
                    resolve({ expression: text, imports });
                } else {
                    const res = await api.post("morph/parse-exp", { value: text });
                    resolve({ expression: res, imports })
                }
            } else {
                resolve({ expression: "", imports });
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
                                    if (e.shiftKey) {
                                        meta.text.splice(idx - 1, 0, "");
                                        const target = e.target;
                                        setTimeout(() => {
                                            const sibling = target.parentNode.parentNode.previousSibling;
                                            if (sibling) {
                                                const node = _.get(sibling, `childNodes.0.childNodes.0`);
                                                if (node) node.focus()
                                            }
                                        })
                                    } else {
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
const splitStringByAwaitApi = (val: string): string[] => {
    const api = val.split("await api");

    return api.map((e, index) => {
        if (index > 0)
            return "await api" + e
        return e;
    });
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
    let res = val;

    if (res[res.length - 1] === ";") {
        res = res.substr(0, res.length - 1)
    }
    return [res];
}
