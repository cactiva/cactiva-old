import React from 'react';
import { Dialog } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import editor from '@src/store/editor';
import MonacoEditor from 'react-monaco-editor';
import { observable } from 'mobx';
const meta = observable({
    language: "typescript",
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
        minHeightContent={400}
        width={700}
    >
        <div className="cactiva-dialog-editor">
            <MonacoEditor
                theme="vs-dark"
                width={700}
                height={400}
                value={meta.value}
                options={{ fontSize: 11 }}
                language={meta.language}
                onChange={(e) => {
                    meta.value = e;
                    meta.changed = true;
                }}
            />
        </div>
    </Dialog>;
});

export const promptCode = (value?: string, type = "typescript") => {
    editor.modals.codeEditor = true;
    meta.language = type;
    meta.value = value || '';
    meta.changed = false;
    return new Promise(resolve => {
        meta.resolve = resolve;
    });
}