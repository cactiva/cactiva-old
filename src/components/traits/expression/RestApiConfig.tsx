import { fontFamily } from "@src/App";
import { isQuote, promptExpression } from "@src/components/editor/CactivaExpressionDialog";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import { parseValue } from "@src/components/editor/utility/parser/parser";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import { Button, IconButton, Select, SelectMenu, Text } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import MonacoEditor from "react-monaco-editor";
import TextareaAutosize from 'react-textarea-autosize';

export default observer(({ source }: any) => {
    const meta = useObservable({
        current: {
            source,
            unsaved: true,
            lastOtherGet: 0 as any,
            bodyLanguage: 'javascript'
        }
    });
    const value = parseValue(meta.current.source);
    const setObjectLiteral = (key: string, value: any) => {
        const result = {} as any;
        Object.keys(value).map(v => {
            if (typeof value[v] === 'string')
                result[v] = {
                    kind: SyntaxKind.StringLiteral,
                    value: JSON.stringify(value[v])
                };
            else {
                result[v] = value[v];
            }
        })

        _.set(meta, `current.source.value.${key}`, {
            kind: SyntaxKind.ObjectLiteralExpression,
            value: result
        })
    }
    return <div style={{ width: '100%', padding: '10px 0px', overflowY: 'auto' }}>
        <div className="field">
            <Button flex={1} marginLeft={10} marginRight={10}>
                {''}
            </Button>
            <Button
                onClick={() => {
                    meta.current.unsaved = true;
                    _.set(meta, 'current.source.value.method.value', "'get'")
                }}
                appearance="minimal"
                style={{ boxShadow: 'none', padding: '0px  5px', marginRight: '10px', background: 'none' }}
                iconBefore={value.method === "get" ? "tick-circle" : 'circle'}
                intent={"success"}>Get</Button>
            <Button
                onClick={() => {
                    if (value.method === 'get') {
                        meta.current.unsaved = true;
                        _.set(meta, 'current.source.value.method.value', "'post'")
                    }
                }}
                marginRight={10}
                style={{ boxShadow: 'none', padding: '0px 5px', background: 'none' }}
                appearance="minimal"
                iconBefore={value.method !== "get" ? "tick-circle" : 'circle'}
                intent={"success"}>{_.capitalize(meta.current.lastOtherGet)}</Button>

            <SelectMenu
                hasFilter={false}
                height={170}
                width={180}
                closeOnSelect={true}
                hasTitle={false}
                options={
                    ['Post', 'Put', 'Head', 'Delete', 'Patch', 'Options']
                        .map(label => ({ label, value: label.toLowerCase() }))
                }
                selected={value.method}
                onSelect={item => {
                    meta.current.unsaved = true;
                    meta.current.lastOtherGet = item.value;
                    _.set(meta, 'current.source.value.method.value', `'${item.value}'`)
                }}
            >
                <IconButton appearance="minimal" icon="caret-down" intent={"success"}
                    style={{ boxShadow: 'none', padding: '0px 10px 0px 0px', background: 'none', width: '30px', marginLeft: '-15px' }}
                />
            </SelectMenu>
        </div>
        <div className="field-cols">
            <div className="col">
                <Text style={{ fontSize: '12px', marginBottom: '3px' }}>Headers</Text>
                {Object.keys(value.headers || {}).map((e: any, k: number) => <SingleRowInput
                    key={k}
                    k={e}
                    v={value.headers[e]}
                    onChange={(m: any) => {
                        if (!!m.key && !!m.value) {
                            if (m.key !== e) {
                                delete value.headers[e];
                            }
                            value.headers[m.key] = m.value;
                            setObjectLiteral('headers', value.headers)
                        } else {
                            delete value.headers[e];
                            setObjectLiteral('headers', value.headers)
                        }
                        meta.current.unsaved = true;
                    }}
                />)}
                <SingleRowInput
                    onChange={(m: any) => {
                        if (!!m.key && !!m.value) {
                            value.headers[m.key] = m.value;
                            m.value = '';
                            m.key = '';
                            setObjectLiteral('headers', value.headers)
                            meta.current.unsaved = true;
                        }
                    }}
                />
            </div>
            <div className="col-divider">&nbsp;</div>
            <div className="col">
                <Text style={{ fontSize: '12px', marginBottom: '3px' }}>Query String</Text>
                {Object.keys(value.queryString || {}).map((e: any, k: number) => <SingleRowInput
                    key={k}
                    k={e}
                    v={value.queryString[e]}
                    onChange={(m: any) => {
                        if (!!m.key && !!m.value) {
                            if (m.key !== e) {
                                delete value.headers[e];
                            }
                            value.queryString[m.key] = m.value;
                            setObjectLiteral('queryString', value.queryString)
                        } else {
                            delete value.headers[e];
                            setObjectLiteral('queryString', value.queryString)
                        }
                        meta.current.unsaved = true;
                    }}
                />)}
                <SingleRowInput
                    onChange={(m: any) => {
                        if (!!m.key && !!m.value) {
                            value.queryString[m.key] = m.value;
                            setObjectLiteral('queryString', value.queryString)
                            m.value = '';
                            m.key = '';
                            meta.current.unsaved = true;
                        }
                    }}
                />
            </div>
        </div>

        {!!value.method && value.method !== 'get' &&
            <div className="field-cols">
                <div className="col">
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Text style={{ fontSize: '12px', flex: 1, marginBottom: '3px' }}> Body</Text>
                        <Select
                            width={65}
                            flex={"none"}
                            height={20}
                            value={meta.current.bodyLanguage}
                            onChange={(e: any) => meta.current.bodyLanguage = e.target.value}>
                            <option value="json">JSON</option>
                            <option value="xml">XML</option>
                            <option value="text">Text</option>
                        </Select>
                    </div>
                    <div className="input">
                        <MonacoEditor
                            theme="vs-light"
                            height={300}
                            value={value.body}
                            onChange={(v) => {
                                meta.current.unsaved = true;
                            }}
                            options={{ fontSize: 11 }}
                            language={meta.current.bodyLanguage}
                        />
                    </div>
                </div>
            </div>
        }
    </div>;
})

const SingleRowInput = observer(({ onChange, k, v }: any) => {
    let orgV = (v || '');
    const meta = useObservable({
        key: k || '',
        value: orgV
    })
    return <div className="col-field">
        <TextareaAutosize spellCheck={false}
            value={meta.key}
            className="input"
            async={true}
            onKeyDown={(event: any) => {
                if ((event.ctrlKey || event.metaKey) && event.which == 83) {
                    event.preventDefault();
                    // CurrentApiSave()
                }
            }}
            style={{
                fontSize: 10,
                fontFamily: fontFamily,
                resize: 'none'
            }}
            onChange={(e: any) => {
                const val = e.target.value;
                meta.key = (val.replace(/\r?\n|\r/g, ''))
            }} onBlur={(e: any) => {
                if (onChange) onChange(meta)
            }} />
        <div className="col-divider"> = </div>
        <TextareaAutosize type="text" spellCheck={false}
            value={meta.value}
            className="input"
            style={{
                paddingRight: 25,
                resize: 'none',
                fontSize: 10,
                fontFamily: fontFamily,
                cursor: meta.value.length === 0 || (meta.value.length > 0 && isQuote(meta.value[0])) ? undefined : 'pointer'
            }}
            onKeyDown={(event: any) => {
                if ((event.ctrlKey || event.metaKey) && event.which == 83) {
                    event.preventDefault();
                    // CurrentApiSave()
                }
            }}
            onClick={async (e: any) => {
                const val = meta.value;
                if (val.length > 0 && !isQuote(val[0])) {
                    meta.value = (await promptExpression({ value: meta.value })).expression
                }
            }} onBlur={(e: any) => {
                if (e.target.value.length === 1) {
                    meta.value = '';
                }
                if (onChange) onChange(meta)
            }} onFocus={(e: any) => {
                const val = e.target.value;
                if (val.length === 0) {
                    meta.value = ("''");
                    const target = e.target;
                    setTimeout(() => {
                        target.setSelectionRange(1, 1);
                    }, 50);
                }
            }} onChange={(e: any) => {
                const val = e.target.value;
                if (val.length > 0 && (isQuote(val[0]) || isQuote(val[val.length - 1]))) {
                    if (isQuote(val[0])) {
                        const q = val[0];
                        if (val[val.length - 1] !== q) {
                            meta.value = (val + q);
                            const target = e.target;
                            setTimeout(() => {
                                target.setSelectionRange(val.length, val.length);
                            }, 0);
                        } else {
                            meta.value = (val)
                        }
                    } else if (isQuote(val[val.length - 1])) {
                        const q = val[val.length - 1];
                        if (val[0] !== q) {
                            meta.value = (q + val);
                            const target = e.target;
                            setTimeout(() => {
                                target.setSelectionRange(1, 1);
                            }, 0);
                        } else {
                            meta.value = (val)
                        }
                    }
                } else if (val.length === 0) {
                    meta.value = (val)
                }
            }} />
        <IconButton icon={'function'} onClick={() => {
            (async () => {
                meta.value = (await promptExpression({ value: meta.value })).expression
            })()
        }}
            iconSize={13}
            height={19}
            style={{ position: "absolute", right: 2, top: 2 }} />
    </div>;
})

const setImport = (imports: any, meta: any) => {
    const src = meta.current.content.split('export default ');
    const cimports = src.shift().split('\n').filter((e: string) => !!e);

    Object.keys(imports).map((i) => {
        const im = imports[i];
        const imtext = `import ${im.type === 'default' ? i : `{ ${i} }`} from "${im.from}"`
        if (cimports.indexOf(imtext) < 0) {
            cimports.push(imtext);
        }
    })

    meta.current.content = `
${cimports.join("\n")}

export default ${src[0]}`;

}