import editor from '@src/store/editor';
import { Button, Dialog, Icon, Pane, SelectMenu, Tab, Tablist, TextInput } from 'evergreen-ui';
import _ from "lodash";
import { observable } from 'mobx';
import { observer, useObservable } from 'mobx-react-lite';
import { default as React, useEffect, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';
import "./Hasura.scss";

const meta = observable({
    language: "javascript",
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
            if (meta.resolve) {
                meta.resolve(null);
            }
        }}
        minHeightContent={500}
        width={800}
    >
        <div className="cactiva-dialog-editor">
            <HasuraForm />
        </div>
    </Dialog>;
}

export const promptHasura = () => {
    editor.modals.hasura = true;
    return new Promise(resolve => {
        meta.resolve = resolve;
    });
}

const HasuraForm = observer(() => {
    const tabs = ['Header', 'Body'];
    const meta = useObservable({
        method: 'get' as any,
        url: '',
        w: 0,
        h: 0,
        tab: 1,
        request: {
            header: '{}',
            body: '{}'
        },
        response: {
            header: '',
            body: ''
        },
    });
    const ref = useRef(null as any);
    useEffect(() => {
        if (ref && ref.current) {
            setTimeout(() => {
                meta.w = ref.current.offsetWidth - 20;
                meta.h = ref.current.offsetHeight - 20;
            })
        }
    }, [ref.current]);

    return <div className="rest-api-form">
        <div className="reqres">
            <div className="tabs">
                <Tablist marginBottom={16} flexBasis={240} marginRight={24}>
                    <div className="title">
                        Request
                    </div> {tabs.map((tab, index) => (
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
                    <Button className="small-btn">Test</Button>
                    {tabs.map((tab, index) => (
                        <Tab
                            key={tab}
                            id={tab}
                            onSelect={() => meta.tab = 2 + index}
                            isSelected={index === meta.tab - 2}
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
                            value={meta.request.header}
                            onChange={(v) => {
                                meta.request.header = v;
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
                            value={meta.request.body}
                            onChange={(v) => {
                                meta.request.body = v;
                            }}
                            options={{ fontSize: 11, minimap: { enabled: false } }}
                            language={'graphql'}
                        />
                    </Pane>,
                    2: <Pane padding={16} background="#E9F2FA" flex="1">
                        <MonacoEditor
                            theme="vs-light"
                            width={meta.w}
                            height={meta.h}
                            value={meta.response.header}
                            onChange={(v) => {
                            }}
                            options={{ fontSize: 11, minimap: { enabled: false } }}
                            language={'json'}
                        />
                    </Pane>,
                    3: <Pane padding={16} background="#E9F2FA" flex="1">
                        <MonacoEditor
                            theme="vs-light"
                            width={meta.w}
                            height={meta.h}
                            value={meta.response.body}
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
                <Button marginLeft={5}>[Empty Variable]</Button>
            </div>
        </div>
    </div>
})