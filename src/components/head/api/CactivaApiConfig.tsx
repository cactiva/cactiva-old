import { promptExpression } from "@src/components/editor/CactivaExpressionDialog";
import { uuid } from "@src/components/editor/utility/elements/tools";
import { parseValue } from "@src/components/editor/utility/parser/parser";
import { Button, Select, IconButton, SelectMenu, Text } from "evergreen-ui";
import _ from "lodash";
import { observer } from "mobx-react-lite";
import React from "react";
import MonacoEditor from "react-monaco-editor";
import { genApiSourceFromConfig } from "./CactivaApiEditor";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";

export default observer(({ meta }: any) => {
    const value = parseValue(meta.current.source);
    value.url = generateSource(_.get(meta, 'current.source.value.url'));
    return <div style={{ width: '100%', padding: '10px 0px', overflowY: 'auto' }}>
        <div className="field">
            <Button flex={1} marginLeft={10} marginRight={10} onClick={() => {
                (async () => {
                    const res = await promptExpression({
                        local: false,
                        value: value.url
                    });
                    meta.current.unsaved = true;
                    _.set(meta, 'current.source.value.url', res);
                    genApiSourceFromConfig();
                })()
            }}>
                {value.url}
            </Button>
            <Button
                onClick={() => {
                    meta.current.unsaved = true;
                    _.set(meta, 'current.source.value.method.value', "'get'")
                    genApiSourceFromConfig();
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
                        genApiSourceFromConfig();
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
                    ['Post', 'Put', 'Delete', 'Patch', 'Option']
                        .map(label => ({ label, value: label.toLowerCase() }))
                }
                selected={value.method}
                onSelect={item => {
                    meta.current.unsaved = true;
                    meta.current.lastOtherGet = item.value;
                    _.set(meta, 'current.source.value.method.value', `'${item.value}'`)
                    genApiSourceFromConfig();
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
                {[0, 1, 2, 3, 4, 5].map(() => (<div key={uuid("headers")} className="col-field">
                    <input type="text" spellCheck={false} />
                    <div className="col-divider" > = </div>
                    <input type="text" spellCheck={false} />
                </div>))}
            </div>
            <div className="col-divider">&nbsp;</div>
            <div className="col">
                <Text style={{ fontSize: '12px', marginBottom: '3px' }}>Query String</Text>
                {[0, 1, 2, 3, 4, 5].map(() => (<div key={uuid("qstring")} className="col-field">
                    <input type="text" spellCheck={false} />
                    <div className="col-divider" > = </div>
                    <input type="text" spellCheck={false} />
                </div>))}
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