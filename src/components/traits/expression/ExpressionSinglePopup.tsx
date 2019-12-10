import React from 'react';
import { Dialog, Text } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import editor from '@src/store/editor';
import MonacoEditor from 'react-monaco-editor';
import { observable } from 'mobx';
import _ from 'lodash';
import "./ExpressionSinglePopup.scss";
import api from '@src/libs/api';

interface IPromptOptions {
    value?: string,
    title?: string,
    pre?: string,
    post?: string,
    footer?: string,
    wrapExp?: string,
    local?: boolean,
    language?: string,
    returnExp?: boolean,
    lineNumbers?: "on" | "off",
    size?: {
        w: number,
        h: number
    }
}

const meta = observable({
    value: '',
    changed: false,
    resolve: null as any,
    options: {} as IPromptOptions
})
export default observer(() => {
    const opt = meta.options;
    const minHeight = _.get(opt, 'size.h', 230);
    const minWidth = _.get(opt, 'size.w', 500);
    let height = minHeight - 20;
    if (opt.title) height -= 25;
    if (opt.pre) height -= 25;
    if (opt.post) height -= 25;
    if (opt.footer) height -= 25;

    return <Dialog
        isShown={true}
        hasHeader={false}
        hasFooter={false}
        preventBodyScrolling
        shouldCloseOnEscapePress={false}
        onCloseComplete={async () => {
            editor.modals.expression = false;
            if (meta.resolve) {
                if (opt.wrapExp && !!meta.value) {
                    meta.value = opt.wrapExp.replace('[[value]]', meta.value);
                }

                if (!opt.returnExp || !meta.value) {
                    meta.resolve({
                        expression: meta.value,
                        changed: meta.changed,
                        imports: {}
                    });
                } else {
                    const res = await api.post("morph/parse-exp", { value: meta.value });
                    meta.resolve({
                        expression: res,
                        changed: meta.changed,
                        imports: {}
                    });
                }
            }
        }}
        minHeightContent={minHeight}
        width={minWidth}
    >
        <div className="cactiva-dialog-editor expr-dialog">
            {opt.title && <Text style={{ marginBottom: '5px', marginLeft: 5 }}>
                {opt.title}
            </Text>}
            <div className="content">
                {opt.pre && <Text style={{ marginBottom: '5px' }}>
                    {opt.pre}
                </Text>}
                {editor.modals.expression && <MonacoEditor
                    theme="vs-light"
                    width={minWidth - 10}
                    height={height}
                    value={meta.value}
                    options={{
                        fontSize: 13,
                        wordWrap: "on",
                        lineNumbers: _.get(opt, 'lineNumbers', 'off'),
                        minimap: { enabled: false }
                    }}
                    language={meta.options.language || 'typescript'}
                    onChange={(e) => {
                        meta.value = e;
                        meta.changed = true;
                    }}
                    editorWillMount={(monaco: any) => {
                        editor.setupMonaco(monaco, { local: opt.local });
                    }}
                    editorDidMount={(ed: any, monaco: any) => {
                        ed.addAction({
                            id: "cactiva-save",
                            label: "Save",
                            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
                            run: async function (ed: any) {
                                if (editor.current) editor.current.save();
                            }
                        });
                    }}
                />}
                {opt.post && <Text style={{ marginTop: '5px' }}>
                    {opt.post}
                </Text>}
            </div>
            {opt.footer && <Text style={{ marginTop: '5px', marginLeft: 5 }}>
                {opt.footer}
            </Text>}
        </div>
    </Dialog>;
});
export const promptExpression = (options?: IPromptOptions): Promise<{ expression: string, changed: boolean, imports: any }> => {
    editor.modals.expression = true;
    if (options)
        meta.options = options;

    meta.value = meta.options.value || '';
    meta.changed = false;
    return new Promise(resolve => {
        meta.resolve = resolve;
    });
} 