import { promptExpression } from '@src/components/editor/CactivaExpressionDialog';
import editor from '@src/store/editor';
import Axios from 'axios';
import { Alert, Button, Dialog, Icon, Pane, SelectMenu, Tab, Tablist, TextInput } from 'evergreen-ui';
import _ from "lodash";
import { observable, toJS } from 'mobx';
import { observer, useObservable } from 'mobx-react-lite';
import { default as React, useEffect, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';
import "./Hasura.scss";
import api from '@src/libs/api';
const form = {
    url: "",
    method: "get",
    request: {
        header: "",
        query: "",
        payload: ""
    },
    response: {
        url: "",
        status: 0,
        statusText: "",
        header: "",
        body: ""
    },
    setVar: "",
    imports: [] as any
};
const meta = observable({
    language: "javascript",
    form: _.cloneDeep(form),
    lastForm: null as any,
    resolve: null as any
})
export default () => {
    return <Dialog
        isShown={true}
        hasHeader={false}
        hasFooter={false}
        preventBodyScrolling
        shouldCloseOnEscapePress={false}
        onCloseComplete={() => {
            editor.modals.hasura = false;
            const varname = meta.form.setVar ? `${meta.form.setVar} = ` : '';
            const header = meta.form.request.header;
            const query = meta.form.request.query;
            const payload = meta.form.request.payload;
            const result = {
                source: ` ${varname} await query('${query}', ${payload}, {
                   ${header ? `headers: ${header}` : ''}
                });
            `, imports: {
                    ...meta.form.imports,
                    query: {
                        from: "@src/libs/gql",
                        type: "named"
                    }
                }
            };
            console.log(result);
            if (meta.resolve) {
                meta.resolve(result);
            }
        }}
        minHeightContent={500}
        width={800}
    >
        <div className="cactiva-dialog-editor">
            <HasuraForm form={meta.form} />
        </div>
    </Dialog>;
}

export const promptHasura = () => {
    editor.modals.hasura = true;
    meta.lastForm = meta.form;

    let url = meta.form.url;
    meta.form = _.cloneDeep(form);
    meta.form.url = url;
    return new Promise(resolve => {
        meta.resolve = resolve;
    });
}

const HasuraForm = observer(({ form }: any) => {
    const tabs = ['Header', 'Body'];
    const meta = useObservable({
        w: 0,
        h: 0,
        tab: 1,
    });
    const ref = useRef(null as any);
    useEffect(() => {
        if (ref && ref.current) {
            setTimeout(() => {
                meta.w = ref.current.offsetWidth - 20;
                meta.h = ref.current.offsetHeight - 20;
            })
        }
    }, [ref.current, form.response.status]);

    const responseAlert = <Alert
        intent={form.response.status >= 200 && form.response.status < 300 ? "success" : "danger"}
    >{`HTTP Status: ${form.response.status} - ${form.response.statusText}`}</Alert>;

    return <div className="rest-api-form">
        <div className="reqres">
            <div className="tabs">
                <Tablist marginBottom={16} flexBasis={240} marginRight={24}>
                    <div className="title">
                        Request
                    </div> {['Header', 'Query', 'Payload'].map((tab, index) => (
                            <Tab
                                key={tab}
                                id={tab}
                                onSelect={() => meta.tab = index}
                                isSelected={index === meta.tab}
                                aria-controls={`panel-${tab}`}
                            >
                                {tab}
                            </Tab>
                        ))}
                </Tablist>

                <Tablist marginBottom={16} flexBasis={240} marginRight={24}>
                    <div className="title">
                        Response
                    </div>
                    <Button className="small-btn" onClick={async (e: any) => {
                        meta.tab = 4;
                        form.response.status = 0;
                        form.response.body = "Loading...";
                        form.response.headers = "Loading...";
                        const res = await api.post("project/gql-query", {
                            query: form.request.query,
                            payload: form.request.payload,
                            options: {
                                headers: form.request.headers
                            }
                        })

                        form.response.status = res.status;
                        form.response.statusText = res.statusText;
                        form.response.body = JSON.stringify(res.data, null, 2);
                        form.response.header = JSON.stringify(res.headers, null, 2);

                    }}>Test</Button>
                    {tabs.map((tab, index) => (
                        <Tab
                            key={tab}
                            id={tab}
                            onSelect={() => meta.tab = 3 + index}
                            isSelected={index === meta.tab - 3}
                            aria-controls={`panel-${tab}`}
                        >
                            {tab}
                        </Tab>
                    ))}
                </Tablist>
            </div>
            <div className="pane" ref={ref}>
                {({
                    0: <Pane padding={16} background="#E9F2FA" flex="1">
                        <MonacoEditor
                            theme="vs-light"
                            width={meta.w}
                            height={meta.h}
                            value={form.request.header}
                            onChange={(v) => {
                                form.request.header = v;
                            }}
                            options={{ fontSize: 11, minimap: { enabled: false } }}
                            language={'json'}
                        />
                    </Pane>,
                    1: <Pane padding={16} background="#E9F2FA" flex="1">
                        <MonacoEditor
                            theme="vs-light"
                            width={meta.w}
                            height={meta.h}
                            value={form.request.query}
                            onChange={(v) => {
                                console.log(v);
                                form.request.query = v;
                            }}
                            options={{ fontSize: 11, minimap: { enabled: false } }}
                            language={'graphql'}
                        />
                    </Pane>,
                    2: <Pane padding={16} background="#E9F2FA" flex="1">
                        {form.response.status > 0 && responseAlert}
                        <MonacoEditor
                            theme="vs-light"
                            width={meta.w}
                            height={meta.h}
                            value={form.request.payload}
                            onChange={(v) => {
                                form.request.payload = v;
                            }}
                            options={{ fontSize: 11, minimap: { enabled: false } }}
                            language={'json'}
                        />
                    </Pane>,
                    3: <Pane padding={16} background="#E9F2FA" flex="1">
                        {form.response.status > 0 && responseAlert}
                        <MonacoEditor
                            theme="vs-light"
                            width={meta.w}
                            height={meta.h - 55}
                            value={form.response.header}
                            onChange={(v) => {
                            }}
                            options={{ fontSize: 11, minimap: { enabled: false } }}
                            language={'json'}
                        />
                    </Pane>,
                    4: <Pane padding={16} background="#E9F2FA" flex="1">
                        {form.response.status > 0 && responseAlert}
                        <MonacoEditor
                            theme="vs-light"
                            width={meta.w}
                            height={meta.h - 55}
                            value={form.response.body}
                            onChange={(v) => {
                            }}
                            options={{ fontSize: 11, minimap: { enabled: false } }}
                            language={'json'}
                        />
                    </Pane>,
                } as any)[meta.tab]}

            </div>
            <div className="set-result">
                Set result body to:
                <Button marginLeft={5} onClick={async () => {
                    const res = (await promptExpression({
                        value: form.setVar
                    }));
                    form.setVar = res.expression;
                    form.imports = res.imports;
                }}>{form.setVar === "" ? "[Empty Variable]" : form.setVar}</Button>
            </div>
        </div>
    </div>
})

