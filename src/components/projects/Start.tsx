import { fontFamily } from "@src/App";
import { Button, Icon, TextInputField, IconButton, Popover, Menu } from "evergreen-ui";
import { observer, useObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import "./Start.scss";
import useAsyncEffect from "use-async-effect";
import api from "@src/libs/api";
import CactivaCli from "@src/components/head/cli/CactivaCli";

export default observer(() => {
    const meta = useObservable({
        mode: "choose",
        list: [],
        showMenu: -1,
        consoleText: '',
        new: {
            name: "",
            apiUrl: window.location,
            db: { port: "5432", host: "localhost", username: "postgres", password: "postgres", name: "postgres" },
        }
    })
    useAsyncEffect(async () => {
        meta.list = (await api.get("project/list")).list;
    }, [])

    const terminal = useRef(null as any);
    return <div className="start-container" style={{ fontFamily: fontFamily }}>
        <div className="start">
            <div className="start-inner">
                <div className="start-title">
                    <h1>Cactiva</h1>
                    <span>Start or load a project</span>
                </div>
                {({
                    creating: <CactivaCli cliref={terminal} initialText={meta.consoleText} />,
                    new: <div className="projects">
                        <TextInputField label={"Name"} value={meta.new.name} onChange={(e: any) => {
                            meta.new.name = (e.target.value).toLowerCase().replace(/[^0-9a-zA-Z-_]/g, '');
                        }} />
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <TextInputField label={"Database Host"} value={meta.new.db.host} onChange={(e: any) => {
                                meta.new.db.host = (e.target.value);
                            }} flex={1} />
                            <TextInputField label={"Port"} value={meta.new.db.port} onChange={(e: any) => {
                                meta.new.db.port = (e.target.value);
                            }} flexBasis={80} marginLeft={10} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <TextInputField label={"Username"} value={meta.new.db.username} onChange={(e: any) => {
                                meta.new.db.username = (e.target.value);
                            }} flexBasis={80} />
                            <TextInputField label={"Password"} value={meta.new.db.password} onChange={(e: any) => {
                                meta.new.db.password = (e.target.value);
                            }} flexBasis={80} marginLeft={10} />
                            <TextInputField label={"Database Name"} value={meta.new.db.name} onChange={(e: any) => {
                                meta.new.db.name = (e.target.value);
                            }} flex={1} marginLeft={10} />
                        </div>
                        <TextInputField label={"API Host"} value={meta.new.apiUrl} onChange={(e: any) => {
                            meta.new.apiUrl = (e.target.value);
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                            <Button marginRight={10} onClick={async () => {
                                meta.mode = "choose"
                            }}>Cancel</Button>
                            <Button intent="success" appearance={"primary"} onClick={async () => {
                                meta.mode = "creating"
                                await api.post('project/new-project', meta.new);
                                api.stream('new-project-' + meta.new.name, (ev: any) => {
                                    terminal.current.write(ev.data);
                                }, () => {
                                    window.location.reload();
                                })
                            }}>Create New</Button>
                        </div>
                    </div>,
                    choose: <div className="projects">
                        {meta.list.length > 0 && <div className="list">
                            {meta.list.map((item: any, key: number) => <div
                                key={key}
                                className="item">
                                <div className="text"
                                    onClick={async () => {
                                        await api.get(`project/load?name=${item.name}`)
                                        window.location.reload();
                                    }}>
                                    <div className="title">{item.name}</div>
                                    <div className="subtitle">{item.status}</div>
                                </div>
                                <Popover isShown={meta.showMenu === key} content={
                                    <div className="ctree-menu"><Menu>
                                        <Menu.Item
                                            icon="duplicate"
                                            onSelect={() => {
                                            }}>
                                            Duplicate
                                        </Menu.Item>
                                        <Menu.Item
                                            icon="trash"
                                            onSelect={async () => {
                                                meta.showMenu = -1;
                                                item.status = "Deleting... (Do not close this window)";
                                                await api.get(`project/del?name=${item.name}`)
                                                meta.list = (await api.get("project/list")).list;
                                            }}>
                                            Delete
                                        </Menu.Item>
                                    </Menu></div>}>
                                    {({ toggle, getRef, isShown }: any) => {
                                        return <IconButton className="more" innerRef={getRef}
                                            onClick={() => {
                                                toggle();
                                                meta.showMenu = key;
                                                console.log("ASDAS")
                                            }}
                                            appearance="minimal"
                                            icon={"more"} />
                                    }}
                                </Popover>
                            </div>
                            )}
                        </div>}
                        {meta.showMenu >= 0 && (
                            <div
                                onClick={() => meta.showMenu = -1}
                                style={{
                                    position: "fixed",
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    zIndex: 11
                                }}
                            ></div>
                        )}
                        <div className="item" onClick={() => {
                            meta.mode = "new";
                        }} style={{
                            border: "1px solid #ececeb",
                            background: "#fafafa"
                        }}>
                            <Icon icon={"small-plus"} size={32} marginRight={5} color={"#777"}></Icon>
                            <div className="text">
                                <div className="title">New Project</div>
                                <div className="subtitle">Start a Project</div>
                            </div>
                            <span></span>
                        </div>
                    </div>,
                } as any)[meta.mode]}
            </div>
        </div>
    </div>;
})