import React from 'react';
import { Dialog } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import editor from '@src/store/editor';
import MonacoEditor from 'react-monaco-editor';
import { observable } from 'mobx';
import _ from 'lodash';

const meta = observable({
    language: "javascript",
    value: "",
    changed: false,
    resolve: null as any
})
export default observer(() => {
    return <Dialog
        isShown={true}
        hasHeader={false}
        hasFooter={false}
        preventBodyScrolling
        onCloseComplete={() => {
            editor.modals.codeEditor = false;
            if (meta.resolve) {
                if (meta.changed) {
                    meta.resolve(meta.value);
                }
                else {
                    meta.resolve(null);
                }
            }
        }}
        minHeightContent={300}
        width={400}
    >
        <div className="cactiva-dialog-editor">
            <MonacoEditor
                theme="vs-light"
                width={400}
                height={300}
                value={meta.value}
                options={{ fontSize: 13 }}
                language={meta.language}
                onChange={(e) => {
                    meta.value = e;
                    meta.changed = true;
                }}

                editorDidMount={(ed: any, monaco: any) => {
                    ed.addAction({
                        id: "cactiva-save",
                        label: "Save",
                        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
                        run: async function (ed: any) {
                        }
                    });
                }}
            />
        </div>
    </Dialog>;
});

export const promptExpression = (options?: { value?: string }) => {
    editor.modals.codeEditor = true;
    meta.value = _.get(options, 'value', "");
    meta.changed = false;
    return new Promise(resolve => {
        meta.resolve = resolve;
    });
}