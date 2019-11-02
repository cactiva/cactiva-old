import { fuzzyMatch } from "@src/components/ctree/CactivaTree";
import { uuid } from "@src/components/editor/utility/elements/tools";
import api from "@src/libs/api";
import editor from "@src/store/editor";
import { Button, Icon, Menu, Popover, SearchInput, Tab, Tablist, Text } from "evergreen-ui";
import _ from "lodash";
import { observable } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import MonacoEditor from "react-monaco-editor";
import useAsyncEffect from "use-async-effect";
import CactivaApiConfig from "./CactivaApiConfig";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import CactivaApiRun, { runApi } from "./CactivaApiRun";
import typescript from "prettier/parser-typescript";
import prettier from "prettier/standalone";
import hotkeys from "hotkeys-js";

const meta = observable({
    list: [] as any,
    current: {
        path: "",
        content: "",
        source: {},
        loaded: false,
        unsaved: false,
        lastOtherGet: 'post',
        bodyLanguage: "json",
        result: {
            url: "",
            loading: true,
            statusCode: 0,
            headers: "",
            body: ""
        }
    },
    w: 0,
    h: 0,
    shown: -1,
    coord: {
        top: 0,
        left: 0,
    },
    listenEditorChanges: true,
    tabs: ["Config", "Test", "Source Code",],
    selectedTab: 0,
    filter: ""
});

export const CurrentApiSave = () => {
    (async () => {
        if (editor.modals.api) {
            await api.post(`api/writefile?path=${meta.current.path}`, { value: meta.current.content });
            meta.current.unsaved = false;
        }
    })()
}
hotkeys("ctrl+s,command+s", (event, handler) => {
    CurrentApiSave();
    event.preventDefault();
});

export const generateApiSourceFromConfig = () => {
    const src = meta.current.content.split('export default ');
    const cimports = (src.shift() || "").split('\n').filter((e: string) => !!e).map(e => e.trim());

    if (cimports.indexOf(`import { createApi } from "@src/utility/api";`) < 0) {
        cimports.push(`import { createApi } from "@src/utility/api";`);
    }

    meta.current.content = prettier.format(`
${cimports.join("\n")}

export default createApi(${generateSource(meta.current.source)});`,
        {
            parser: "typescript",
            plugins: [typescript]
        }).trim();
}
export default observer(() => {
    const monacoRef = useRef(null as any);
    const monacoEdRef = useRef(null as any);
    const cref = useRef(null as any);
    const reloadList = async () => {
        const res = await api.get("api/list");
        meta.list = res.children;

        if (meta.list.length > 0) {
            await load(monacoEdRef, meta.list[0].relativePath);
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
        const res = await api.get(`api/readfile?path=${path}`);
        if (res) {
            meta.current.content = res.text;
            meta.current.source = res.source;
            if (monacoEdRef.current)
                monacoEdRef.current.setValue(meta.current.content);
        }
        meta.current.loaded = true;
        meta.shown = -1;
    }
    useEffect(() => {
        const resize = () => {
            if (cref.current) {
                meta.w = cref.current.offsetWidth;
                meta.h = cref.current.offsetHeight;
                if (monacoEdRef.current)
                    monacoEdRef.current.layout();
            }
        };
        resize();
        window.addEventListener('resize', resize)
        return () => {
            window.addEventListener('resize', resize);
        }
    }, [])

    useEffect(() => {
        if (meta.current.unsaved) {
            editor.modals.apiLock = true;
        } else {
            editor.modals.apiLock = false;
        }
    }, [meta.current.unsaved])

    useAsyncEffect(reloadList, []);
    return <div className="cactiva-dialog-editor">
        <div className="list" onContextMenu={(e) => { e.preventDefault(); }}>
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
                        const newname = prompt("New API name:");
                        if (newname) {
                            const relPath = _.lowerCase(newname).replace(/[^0-9a-zA-Z]/g, "") + ".ts";
                            const path =
                                "/src/api/" + relPath;
                            editor.status = "creating";
                            try {
                                await api.get(`api/newfile?path=${path}`);
                                meta.current.path = "./" + relPath;
                                meta.current.content = await api.get(`api/readfile?path=${"./" + relPath}`);
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
                                                        `ctree/move?old=${e.relativePath.replace('./', './src/api/')}&new=${path.join("/").replace('./', './src/api/')}`
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
                                                    await api.get(`ctree/delete?path=${e.relativePath.replace('./', './src/api/')}`);
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
        <div className="content-container">
            <Tablist>
                {meta.current.unsaved && (
                    <div style={{
                        position: "absolute",
                        right: -2,
                        top: -1,
                    }}>
                        <Button
                            style={{ fontSize: 10 }}
                            marginRight={5}
                            height={20}
                            intent="success"
                            appearance="primary"
                            onClick={(e: any) => {
                                CurrentApiSave();
                            }}>Save - Ctrl/⌘+S</Button>
                        <Button
                            style={{ fontSize: 10 }}
                            marginRight={5}
                            height={20}
                            intent="danger"
                            appearance="primary"
                            onClick={(e: any) => {
                                if (confirm("Are you sure ?")) {
                                    editor.modals.apiLock = false;
                                    editor.modals.api = false;
                                    meta.current.unsaved = false;
                                }
                            }}>Discard</Button>
                    </div>)}
                {meta.tabs.map((tab, index) => (
                    <Tab
                        key={tab}
                        onSelect={async () => {
                            if (meta.selectedTab === 2 && index !== 2) {
                                const res = await api.post('api/parse', {
                                    value: meta.current.content
                                })
                                meta.current.source = res.source;
                            } else if (index !== 0) {
                                generateApiSourceFromConfig();
                            }

                            if (index === 1) {
                                setTimeout(() => {
                                    runApi(meta);
                                }, 200)
                            }

                            meta.selectedTab = index

                        }}
                        isSelected={index === meta.selectedTab}
                        aria-controls={`panel-${tab}`}
                    >
                        {tab}
                    </Tab>
                ))}
            </Tablist>
            <div className="content" ref={cref}>
                {meta.selectedTab === 0 && (<CactivaApiConfig meta={meta} />)}
                {meta.selectedTab === 1 && (<CactivaApiRun meta={meta} />)}
                {meta.selectedTab === 2 &&
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
                                    const res = await api.post(`api/writefile?path=${meta.current.path}`, { value: meta.current.content });
                                    meta.current.unsaved = false;
                                    return null;
                                }
                            });
                            monacoEdRef.current.layout();
                        }}
                        language={"typescript"}
                    />
                }
            </div>
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