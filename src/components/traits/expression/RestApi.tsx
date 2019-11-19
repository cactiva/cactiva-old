import editor from '@src/store/editor';
import { Dialog } from 'evergreen-ui';
import { observable } from 'mobx';
import React from 'react';
import RestApiForm from './RestApiForm';
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
        onCloseComplete={() => {
            editor.modals.restApi = false;
            if (meta.resolve) {
                meta.resolve(null);
            }
        }}
        minHeightContent={500}
        width={800}
    >
        <div className="cactiva-dialog-editor">
            <RestApiForm />
        </div>
    </Dialog>;
}

export const promptRestApi = () => {
    editor.modals.restApi = true;
    return new Promise(resolve => {
        meta.resolve = resolve;
    });
}