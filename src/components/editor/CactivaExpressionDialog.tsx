import api from '@src/libs/api';
import editor from '@src/store/editor';
import { Autocomplete, Dialog, Text } from 'evergreen-ui';
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useRef } from 'react';
import AutosizeInput from 'react-input-autosize';
import useAsyncEffect from 'use-async-effect';
import { parseValue } from './utility/parser/parser';

const onCloseDialog = () => {
    return;
}
const meta = observable({
    title: 'Please type an expression',
    defintions: {} as any,
    suggestions: [] as string[],
    text: [""],
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
    useAsyncEffect(async () => {
        const res = await api.get("store/definition");
        meta.defintions = {};
        Object.keys(res).map((r: string) => {
            meta.defintions[r] = parseValue(res[r]);
        })
        meta.suggestions = generateSuggestions(meta.defintions);
        if (firstRef && firstRef.current) {
            firstRef.current.focus();
        }
    }, []);
    const openMenuRefs = useRef({} as any);
    const firstRef = useRef(null as any);
    return <Dialog isShown={editor.modals.expression}
        hasHeader={false}
        hasFooter={false}
        preventBodyScrolling
        onCloseComplete={onCloseDialog}
        minHeightContent={65}
        width={400}>
        <div className="expr-dialog">
            <Text>
                {meta.title}
            </Text>
            <div className="content">
                {meta.text.map((item, key: number) => {
                    const onSelect = (changedItem: any) => {
                        meta.text[key] = changedItem;
                    }
                    return <ExpInput inputRef={key === 0 ? firstRef : undefined}
                        onSelect={onSelect}
                        key={key}
                        idx={key}
                        openMenuRefs={openMenuRefs} item={item} />
                })
                }
            </div>
        </div>
    </Dialog>
})

export const getExpression = async (title = '') => {
    editor.modals.expression = true;
    meta.title = title;
    return "";
}

const ExpInput = observer(({ onSelect, idx, openMenuRefs, item, inputRef }: any) => {
    const key = idx;
    return <Autocomplete
        onChange={onSelect}
        onSelect={onSelect}
        items={meta.suggestions}
        children={(props) => {
            const { getInputProps, getRef, openMenu, isShown } = props
            openMenuRefs.current[idx] = openMenu;
            return (
                <AutosizeInput
                    ref={inputRef}
                    inputRef={getRef}
                    className="input"
                    spellCheck={false}
                    {...getInputProps({
                        onFocus: (e: any) => {
                            const val = e.target.value.match(regex);
                            if (!val || !!val && val.length === 0) {
                                openMenu();
                            }
                        },
                        value: item,
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
                                                sibling.childNodes[0].childNodes[0].focus();
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
                                            sibling.childNodes[0].childNodes[0].focus()
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
                                            sibling.childNodes[0].childNodes[0].focus()
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
                                            sibling.childNodes[0].childNodes[0].focus()
                                        }
                                    })
                                }
                            }
                            if (e.which === 13) {
                                if (!isShown) {
                                    console.log('dismiss');
                                }
                            }
                        },
                        onChange: (e: any) => {
                            const val = e.target.value;
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
                                    if (key === 0 && split.length === 1) {
                                        return;
                                    }
                                    const length = meta.text.length
                                    const res = result.filter(e => !!e);
                                    meta.text.splice(key, 1, ...res);
                                    const target = e.target;
                                    setTimeout(() => {
                                        if (length !== meta.text.length) {
                                            let sibling = target.parentNode.parentNode.nextSibling;

                                            if (target.selectionStart < val.length / 2) {
                                                sibling = target.parentNode.parentNode.previousSibling;
                                            }
                                            if (sibling) {
                                                sibling.childNodes[0].childNodes[0].focus()
                                            }
                                        }
                                    })
                                }
                            } else {
                                item = val;
                            }
                        },
                    })}

                />
            )
        }}
    />
})