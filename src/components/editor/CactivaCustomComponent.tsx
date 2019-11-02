import editor from '@src/store/editor';
import { Autocomplete, Dialog, TextInput } from 'evergreen-ui';
import _ from "lodash";
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef } from 'react';
import { treeListMeta, reloadTreeList } from '../ctree/CactivaTree';
import api from '@src/libs/api';
import { createNewElement } from './utility/elements/tools';

const meta = observable({
    source: null,
    shouldFocusFirst: true,
    closing: false,
    list: [] as any[]
});
const onCloseDialog = () => {
    if (document.activeElement) {
        (document.activeElement as any).blur();
    }
    meta.closing = true;
    editor.modals.customComponents = false;
    setTimeout(() => {
        meta.shouldFocusFirst = false;
        setTimeout(() => {
            meta.closing = false;
        });
    });
}
export default observer(({ }: any) => {
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
    useEffect(() => {
        meta.list = [{
            label: '— New Component —',
            path: 'new-component'
        }];
        const walk = (list: any[]) => {
            for (let i in list) {
                const e = list[i];
                if (!e.children)
                    meta.list.push({
                        label: e.relativePath.substr(5, e.relativePath.length - 9),
                        path: e.relativePath
                    })
                else walk(e.children)
            }
        }
        walk(treeListMeta.list);
    }, [treeListMeta.list])
    return <Dialog
        isShown={editor.modals.customComponents}
        hasHeader={false}
        hasFooter={false}
        onCloseComplete={onCloseDialog}
        preventBodyScrolling
        minHeightContent={60}
        width={400}
    >
        <Autocomplete
            onChange={async (value) => {
                const item = _.find(meta.list, { label: value });
                onCloseDialog();
                let path = item.path;
                if (item.path === 'new-component' && editor.current) {
                    const name = prompt("New Component Name:");
                    if (name) {
                        const spath = editor.current.path.split("/");
                        spath.pop();
                        path = spath.join("/") + "/" + _.startCase(name || "").replace(/[^0-9a-zA-Z]/g, "") + ".tsx";

                        editor.status = "creating";
                        try {
                            await api.get(`ctree/newfile?path=${path}`);
                        } catch (e) {
                            console.log(e);
                        }
                        await reloadTreeList();
                        editor.status = "ready";
                    } else return;
                }

                meta.source = path;
            }}
            items={meta.list.map(e => e.label)}
        >
            {(props) => {
                const { getInputProps, getRef, inputValue, openMenu } = props
                return (
                    <TextInput
                        placeholder="Choose Component"
                        width={'100%'}
                        value={inputValue}
                        innerRef={(e) => {
                            firstRef.current = e
                            getRef(e);
                        }}
                        {...getInputProps({
                            onFocus: () => {
                                if (!meta.closing) {
                                    openMenu()
                                }
                            }
                        })}
                    />
                )
            }}
        </Autocomplete>
    </Dialog>
});

export const promptCustomComponent = (options?: { value: string }): Promise<any> => {
    return new Promise(resolve => {
        if (editor.modals.customComponents === true) {
            editor.modals.customComponents = false;
            setTimeout(() => editor.modals.customComponents = true, 300);
            return;
        }
        meta.source = null;
        meta.shouldFocusFirst = true;
        meta.closing = false;
        editor.modals.customComponents = true;

        const finish = async () => {
            resolve(meta.source)
        }

        const iv = setInterval(() => {
            if (!editor.modals.customComponents) {
                clearInterval(iv);
                finish();
            }
        }, 500)
    })
}