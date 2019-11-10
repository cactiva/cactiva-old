import { fontFamily } from "@src/App";
import CactivaProjectForm from "@src/components/projects/CactivaProjectForm";
import api from "@src/libs/api";
import editor from "@src/store/editor";
import { Button, Dialog, IconButton, Tab, Tablist } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import CactivaCli from "../CactivaCli";
import "./CactivaProject.scss";

const start = async (name: string, ref: any) => {
    const ed = (editor as any)[name];
    ed.status = "started"
    const res = await api.get(`project/start-${name}`);
    if (res.status === "ok") {
        ed.logs = "";
        api.stream(`${name}-${editor.name}`, processMsg(ed, ref.current, name))
    }
}

function padCenter(s: any, max: any) {
    return s
        .padStart(s.length + Math.floor((max - s.length) / 2), ' ')
        .padEnd(max, ' ')
}

const processMsg = (ed: any, r: any, name: string) => {
    return (msg: any) => {
        let m = msg.data;
        if (name === 'hasura') {
            m = (msg.data.split("\n").filter((e: string) => !!e).map((e: string) => {
                try {
                    const info = JSON.parse(e);
                    return `[${info.timestamp}]-[${padCenter(info.level, 10)}]-[${padCenter(info.type, 10)}]-[${padCenter(info.detail.kind, 20)}] 
${JSON.stringify(info.detail.info, null, 1)}\n\n`;
                } catch (er) {
                    console.log(er);
                }
            })).join("\n");
        }
        ed.logs += m;
        if (r)
            r.write(m);

        if (name === 'expo') {
            parseExpoMessage(ed.logs);
        }
    }
}

const stop = async (name: string, ref: any) => {
    const ed = (editor as any)[name];
    const res = await api.get(`project/stop-${name}`);
    if (res.status === "ok") {
        ed.status = "stopped";
        ed.logs = "";
    }
}

const parseExpoMessage = async (msg: string) => {
    editor.expo.url = "";
    if (msg.indexOf("Webpack on port") >= 0) {
        editor.expo.url = `http://localhost:${msg
            .split("Webpack on port")[1]
            .split("in")[0]
            .trim()}`;
    }

    if (msg.indexOf("running at exp://") >= 0) {
        const host = msg.split("running at exp://")[1].split(":")[0];
        if (host)
            editor.expo.url = editor.expo.url.replace('localhost', host);
    }
}

export default observer(() => {
    const meta = useObservable({
        index: 0,
        edit: false,
        services: ['expo', 'hasura', 'backend']
    });
    const refs = {
        expo: useRef(null as any),
        hasura: useRef(null as any),
        backend: useRef(null as any)
    } as any;
    const service = meta.services[meta.index];
    const ed = (editor as any)[service];

    useEffect(() => {
        meta.services.forEach(s => {
            const e = (editor as any)[s];
            if (e.status !== 'stopped') {
                api.stream(`${s}-${editor.name}`, processMsg(e, refs[s].current, s))
            }
        })
    }, [])



    return <div className="cactiva-dialog-editor">
        <div className="cactiva-project" style={{ fontFamily: fontFamily }}>
            <div className="header">
                <div className="project">
                    {_.startCase(editor.name)}
                    <IconButton
                        icon={"edit"}
                        className="small-btn"
                        style={{ marginRight: 0, padding: '0px 5px' }}
                        onClick={async () => {
                            meta.edit = true;
                        }} />
                    <Button className="small-btn" onClick={async () => {
                        editor.path = '';
                        editor.name = '';
                    }}>Switch</Button>
                    {editor.expo.url !== "" && <Button className="small-btn" onClick={() => {
                        const win = window.open(editor.expo.url + editor.path.substr(4, editor.path.length - 8), '_blank');
                        if (win) win.focus();
                    }}>Preview App</Button>}
                </div>
                <Tablist>
                    <Button className="small-btn" onClick={() => {
                        if (editor.expo.status === 'stopped') {
                            meta.services.map((name) => {
                                if ((editor as any)[name].status === 'stopped')
                                    start(name, refs[name]);
                            });
                        } else {
                            meta.services.map((name) => {
                                if ((editor as any)[name].status !== 'stopped')
                                    stop(name, refs[name]);
                            });
                        }
                    }}>{editor.expo.status === 'stopped' ? 'Start' : 'Stop'} All</Button>
                    {meta.services.map((name, key) => {
                        return <Tab key={key} isSelected={meta.index === key} onSelect={() => meta.index = key}>
                            {_.startCase(name)}
                            <small>{(editor as any)[name].status}</small>
                        </Tab>
                    })}
                </Tablist>
            </div>
            <div className="content">
                <div className="toolbar">
                    <span>{_.startCase(service)} <small>({ed.status})</small></span>
                    <Button className="small-btn" onClick={() => {
                        if (ed.status === "stopped") {
                            start(service, refs[service]);
                        } else {
                            stop(service, refs[service]);
                        }
                    }}>{ed.status === "stopped" ? "Start" : "Stop"} </Button>
                </div>
                <div className="cli">
                    <div className="cli-content">
                        {service === 'expo' && ed.status !== "stopped" &&
                            <CactivaCli cliref={refs.expo} initialText={editor.expo.logs} />}

                        {service === 'hasura' && ed.status !== "stopped" &&
                            <CactivaCli cliref={refs.hasura} initialText={editor.hasura.logs} />}

                        {service === 'backend' && ed.status !== "stopped" &&
                            <CactivaCli cliref={refs.backend} initialText={editor.backend.logs} />}
                    </div>
                </div>
            </div>
        </div>

        <Dialog isShown={meta.edit}
            onConfirm={async () => {
                await api.post("project/edit-project", editor.settings);
                meta.edit = false;
            }}
            onCloseComplete={() => { meta.edit = false; }} title="Edit Project">
            <CactivaProjectForm form={editor.settings} disable={['name']} />
        </Dialog>
    </div>;
});