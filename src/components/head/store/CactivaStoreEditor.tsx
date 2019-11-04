import React, { useRef, useEffect } from "react";
import { SearchInput, Button, Icon, Text, Popover, Menu } from "evergreen-ui";
import { observer, useObservable } from "mobx-react-lite";
import editor from "@src/store/editor";
import _ from "lodash";
import api from "@src/libs/api";
import useAsyncEffect from "use-async-effect";
import { observable, toJS } from "mobx";
import { uuid } from "@src/components/editor/utility/elements/tools";
import { fuzzyMatch } from "@src/components/ctree/CactivaTree";
import MonacoEditor from "react-monaco-editor";

const meta = observable({
    list: [] as any,
    current: {
        path: "",
        content: "",
        loaded: false,
        unsaved: false,
    },
    w: 0,
    h: 0,
    shown: -1,
    coord: {
        top: 0,
        left: 0,
    },
    listenEditorChanges: true,
    filter: ""
});
export default observer(() => {
    const monacoRef = useRef(null as any);
    const monacoEdRef = useRef(null as any);
    const cref = useRef(null as any);
    const reloadList = async () => {
        const res = await api.get("store/list");
        meta.list = res.children;

        if (meta.list.length > 0) {
            load(monacoEdRef, meta.list[0].relativePath);
        }
    };
    const load = async (monacoEdRef: any, path: any) => {
        if (meta.current.unsaved) {
            if (!confirm("Current file is unsaved, your change will be lost. Continue ?")) {
                return false;
            }
        }
        meta.current.loaded = false;
        meta.current.unsaved = false;
        meta.current.path = path;
        meta.current.content = await api.get(`store/readfile?path=${path}`);
        monacoEdRef.current.setValue(meta.current.content);
        meta.current.loaded = true;
        meta.shown = -1;
    }
    useEffect(() => {
        const resize = () => {
            if (cref.current) {
                meta.w = cref.current.offsetWidth;
                meta.h = cref.current.offsetHeight;
                monacoEdRef.current.layout();
            }
        };
        resize();
        window.addEventListener('resize', resize)
        return () => {
            window.addEventListener('resize', resize);
        }
    }, [])

    useAsyncEffect(reloadList, []);
    return <div className="cactiva-dialog-editor">
        <div className="list" onContextMenu={(e: any) => { e.preventDefault(); }}>
            <div className="search-box">
                <SearchInput
                    className="search"
                    placeholder="Search"
                    width="100%"
                    height={25}
                    onChange={(e: any) => {
                        meta.filter = e.nativeEvent.target.value;
                    }}
                    spellCheck={false}
                />
                <Button className={`search-opt`} onClick={() => {
                    (async () => {
                        const newname = prompt("New component name:");
                        if (newname) {
                            const relPath = _.lowerCase(newname).replace(/[^0-9a-zA-Z]/g, "") + ".ts";
                            const path =
                                "/src/stores/" + relPath;
                            editor.status = "creating";
                            try {
                                await api.get(`store/newfile?path=${path}`);
                                meta.current.path = "./" + relPath;
                                meta.current.content = await api.get(`store/readfile?path=${"./" + relPath}`);
                            } catch (e) {
                                console.log(e);
                            }
                            await reloadList();
                            editor.status = "ready";
                        }
                    })()
                }}
                > <Icon icon={"plus"} size={11} color={"#aaa"} />
                </Button>
            </div>
            <div className="list-items">
                {meta.list.filter((item: any) => {
                    if (meta.filter.length > 0)
                        return fuzzyMatch(
                            meta.filter.toLowerCase(),
                            item.name.toLowerCase()
                        );
                    return true;
                }).map((e: any, key: number) => {
                    let unsaved = false;
                    if (e.relativePath === meta.current.path) {
                        unsaved = meta.current.unsaved
                    }
                    const name = e.name.substr(0, e.name.length - 3);
                    return <Popover key={uuid("store-list")}
                        isShown={meta.shown === key}
                        position="right"
                        statelessProps={{
                            style: {
                                position: 'fixed',
                                top: meta.coord.top,
                                left: meta.coord.left
                            }
                        }}
                        content={
                            <div className="ctree-menu">
                                <div className="cactiva-trait-cmenu-heading">
                                    <Text>{name}</Text>
                                </div>
                                <Menu>
                                    <Menu.Item icon="text-highlight" onSelect={() => {
                                        meta.shown = -1;
                                        setTimeout(async () => {
                                            const newname = prompt("Rename to:", name.replace(".tsx", ""));
                                            if (newname && e.name !== newname) {
                                                const path = e.relativePath.split("/");
                                                path.pop();
                                                if (e.type === "file") {
                                                    path.push(newname.replace(/[^0-9a-zA-Z]/g, "") + ".ts");
                                                } else {
                                                    path.push(newname.replace(/[^0-9a-zA-Z]/g, ""));
                                                }

                                                editor.status = "renaming";
                                                try {
                                                    await api.get(
                                                        `ctree/move?old=${e.relativePath.replace('./', './src/stores/')}&new=${path.join("/").replace('./', './src/stores/')}`
                                                    );
                                                } catch (e) {
                                                    console.log(e);
                                                }
                                                await reloadList();
                                                editor.status = "ready";
                                            }
                                        });
                                    }}>
                                        Rename
                            </Menu.Item>
                                    <Menu.Item icon="trash" intent="danger" onSelect={() => {
                                        meta.shown = -1;
                                        setTimeout(async () => {
                                            if (confirm(`Are you sure want to delete ${e.relativePath}?`)) {
                                                editor.status = "deleting";
                                                try {
                                                    await api.get(`ctree/delete?path=${e.relativePath.replace('./', './src/stores/')}`);
                                                } catch (e) {
                                                    console.log(e);
                                                }
                                                await reloadList();
                                                editor.status = "ready";
                                            }
                                        })
                                    }}>
                                        Delete
                            </Menu.Item>
                                </Menu>
                            </div>
                        }
                    >
                        {({ toggle, getRef, isShown }: any) => {
                            return <>
                                <div
                                    className={`item ${e.relativePath === meta.current.path ? 'selected' : ''}`}
                                    onContextMenuCapture={(e: any) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        meta.shown = key;
                                        meta.coord.top = e.pageY;
                                        meta.coord.left = e.pageX;
                                    }}
                                    onClick={() => { load(monacoEdRef, e.relativePath) }}>
                                    <div className={`icon ${e.type}`}>
                                        <Icon
                                            icon="box"
                                            size={10}
                                            color={unsaved ? "red" : "#66788a"}
                                        />
                                    </div>
                                    <Text
                                        color={unsaved ? "red" : "#333"}
                                        fontWeight={unsaved ? "bold" : "normal"}
                                    >
                                        {name}
                                    </Text>
                                </div>
                            </>
                        }}
                    </Popover>
                })}
            </div>
        </div>
        <div className="content" ref={cref}>
            <MonacoEditor
                theme="vs-dark"
                width={meta.w}
                height={meta.h}
                options={{ fontSize: 11 }}
                value={meta.current.content}
                editorWillMount={(monaco) => {
                    if (editor.current) {
                        editor.current.setupMonaco(monaco);
                    }
                    monacoRef.current = monaco;
                }}
                onChange={(value) => {
                    if (meta.current.loaded) {
                        meta.current.unsaved = true;
                        meta.current.content = value;
                    }
                }}
                editorDidMount={(ed: any, monaco: any) => {
                    monacoEdRef.current = ed;
                    ed.addAction({
                        id: "cactiva-save",
                        label: "Save",
                        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
                        run: async function (ed: any) {
                            const res = await api.post(`store/writefile?path=${meta.current.path}`, { value: meta.current.content });
                            meta.current.unsaved = false;
                            return null;
                        }
                    });
                    monacoEdRef.current.layout();
                }}
                language={"typescript"}
            />
        </div>

        {meta.shown >= 0 && (
            <div
                onContextMenu={() => { meta.shown = -1; }}
                onClick={() => { meta.shown = -1; }}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    zIndex: 10
                }}
            ></div>
        )}
    </div>;
})