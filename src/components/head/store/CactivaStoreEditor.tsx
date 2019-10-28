import React, { useRef } from "react";
import { SearchInput, Button, Icon, Text } from "evergreen-ui";
import { observer, useObservable } from "mobx-react-lite";
import editor from "@src/store/editor";
import _ from "lodash";
import api from "@src/libs/api";
import useAsyncEffect from "use-async-effect";
import { observable } from "mobx";
import { uuid } from "@src/components/editor/utility/elements/tools";
import { fuzzyMatch } from "@src/components/ctree/CactivaTree";
import MonacoEditor from "react-monaco-editor";

const meta = observable({
    list: [],
    unsaved: [] as any,
    current: {
        path: "",
        content: ""
    },
    listenEditorChanges: true,
    filter: ""
});
const reloadList = async () => {
    const res = await api.get("store/list");
    meta.list = res.children;
};
export default observer(() => {
    const monacoRef = useRef(null as any);
    const monacoEdRef = useRef(null as any);
    useAsyncEffect(reloadList, []);
    return <div className="cactiva-dialog-editor">
        <div className="list">
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
                }).map((e: any) => {
                    let unsaved = false;
                    if (meta.unsaved.indexOf(e.relativePath) >= 0) {
                        unsaved = true;
                    }
                    const name = e.name.substr(0, e.name.length - 3);
                    return <div className={`item ${e.relativePath === meta.current.path ? 'selected' : ''}`} key={uuid("store-list")}
                        onClick={async () => {
                            meta.current.path = e.relativePath;
                            meta.current.content = await api.get(`store/readfile?path=${e.relativePath}`);
                        }}>
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
                })}
            </div>
        </div>
        <div className="content">
            <div style={{ width: "50%", height: "50%", position: "absolute" }}>
                <MonacoEditor
                    theme="vs-dark"
                    options={{ fontSize: 11 }}
                    editorWillMount={(monaco) => {
                        if (editor.current) {
                            editor.current.setupMonaco(monaco);
                        }
                        monacoRef.current = monaco;
                    }}
                    editorDidMount={(ed: any, monaco: any) => {
                        monacoEdRef.current = ed;
                        ed.onDidBlurEditorText(function (e: any) {
                            monacoEditorChange(ed.getValue());
                        });
                        ed.onMouseLeave(function (e: any) {
                            monacoEditorChange(ed.getValue());
                        });
                        ed.addAction({
                            id: "cactiva-save",
                            label: "Save",
                            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
                            run: function (ed: any) {
                                monacoEditorChange(ed.getValue());
                                // editor.save();
                                console.log("savingg");
                                return null;
                            }
                        });
                        monacoEdRef.current.layout();
                    }}
                    language={"javascript"}
                /></div>
        </div>
    </div>;
})

const monacoEditorChange = _.debounce(
    value => {
        meta.current.content = value;

        if (meta.unsaved.indexOf(meta.current.path) < 0) {
            meta.unsaved.push(meta.current.path);
        }
    },
    100,
    {
        leading: true
    }
);