import { fontFamily, loadProject } from "@src/App";
import { Button, Icon, TextInputField, IconButton, Popover, Menu, Spinner } from "evergreen-ui";
import { observer, useObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import "./Start.scss";
import useAsyncEffect from "use-async-effect";
import api from "@src/libs/api";
import CactivaCli from "../head/CactivaCli";
import CactivaProjectForm from "./CactivaProjectForm";

export default observer(() => {
    const meta = useObservable({
        mode: "choose",
        list: [],
        showMenu: -1,
        consoleText: '',
        new: {
            name: "",
            apiUrl: window.location.toString(),
            hasuraSecret: "hasura123",
            db: {
                port: "5432",
                host: "localhost",
                user: "postgres",
                password: "postgres",
                database: "postgres"
            },
        }
    })
    useAsyncEffect(async () => {
        meta.list = (await api.get("project/list")).list;
        setInterval(async () => {
            meta.list = (await api.get("project/list")).list;
        }, 3000)
    }, [])

    const terminal = useRef(null as any);
    return <div className="start-container" style={{ fontFamily: fontFamily }}>
        <div className="start">
            <div className="start-inner">
                <div className="start-title">
                    <h1>Cactiva</h1>
                    <span>{meta.mode === 'creating' ? 'Creating new project...' : 'Start or load a project'}</span>

                    {meta.mode === 'creating' && <>
                        <div className="small-btn">
                            Or
                        <Button className="small-btn" style={{ marginLeft: 5 }} onClick={() => { meta.mode = 'choose' }}>
                                Load  a  Project
                            </Button>
                        </div></>}
                </div>
                {({
                    loading: <div className="center-loading"><div>
                        <Spinner size={18} margin={5} />
                        Loading
                    </div></div>,
                    creating: <div style={{ padding: '10px', borderRadius: 5, background: '#000', margin: '25px 0px' }}>
                        <CactivaCli cliref={terminal} initialText={meta.consoleText} />
                    </div>,
                    new: <CactivaProjectForm form={meta.new}
                        onCancel={async () => {
                            meta.mode = "choose"
                        }}
                        onSubmit={async () => {
                            if (!meta.new.name) {
                                alert("Please fill the name");
                                return;
                            }

                            const res = await api.post("project/test-db", meta.new.db);
                            if (res.status !== 'ok') {
                                alert(res.status + '\n' + (res.reason || ""));
                                return;
                            }
                            meta.mode = "creating"
                            await api.post('project/new-project', meta.new);
                            api.stream('new-project-' + meta.new.name, (ev: any) => {
                                terminal.current.write(ev.data);
                            }, () => {
                                loadProject();
                            })
                        }}
                    />,
                    choose: <div className="projects">
                        {meta.list.length > 0 && <div className="list">
                            {meta.list.map((item: any, key: number) => <div
                                key={key}
                                className="item">
                                <div className="text"
                                    onClick={async () => {
                                        if (item.status === 'Closed' || item.status === 'Loaded') {
                                            meta.mode = "loading";
                                            await api.get(`project/load?name=${item.name}`)
                                            await loadProject();
                                            meta.mode = "choose";
                                        }

                                        if (item.status === "Creating") {
                                            meta.mode = "creating";
                                            api.stream('new-project-' + item.name, (ev: any) => {
                                                terminal.current.write(ev.data);
                                            }, () => {
                                                item.status = "Loaded";
                                                loadProject();
                                            })
                                        }
                                    }}>
                                    <div className="title">{item.name}</div>
                                    <div className="subtitle">{item.status}</div>
                                </div>
                                <Popover isShown={meta.showMenu === key} content={
                                    <div className="ctree-menu"><Menu>
                                        <Menu.Item
                                            icon="duplicate"
                                            onSelect={() => {
                                                alert("Sabar ya, sekarang masih belum bisa duplikat projek >_<")
                                            }}>
                                            Duplicate
                                        </Menu.Item>
                                        <Menu.Item
                                            icon="trash"
                                            onSelect={async () => {
                                                meta.showMenu = -1;
                                                if (prompt("Type 'delete' to confirm project deletion:") === "delete") {
                                                    item.status = "Deleting";
                                                    await api.get(`project/del?name=${item.name}`)
                                                    meta.list = (await api.get("project/list")).list;
                                                }
                                            }}>
                                            Delete
                                        </Menu.Item>
                                    </Menu></div>}>
                                    {({ toggle, getRef, isShown }: any) => {
                                        return <IconButton className="more" innerRef={getRef}
                                            onClick={() => {
                                                toggle();
                                                meta.showMenu = key;
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