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
import { toJS } from "mobx";

const start = async (name: string, ref: any) => {
    const ed = (editor as any)[name];
    ed.status = "starting"
    const res = await api.get(`project/start-${name}`);
    if (res.status === "ok") {
        api.stream(`${name}-${editor.name}`, (msg: any) => {
            ed.logs += msg.data;
            ref.current.write(msg.data);
        })
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
                api.stream(`${s}-${editor.name}`, (msg: any) => {
                    ed.logs += msg.data;
                    if (refs[s].current)
                        refs[s].current.write(msg.data);
                })
            }
        })
        console.log(toJS(editor.settings));
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
                    {editor.expo.url !== "" && <Button className="small-btn">Preview App</Button>}
                </div>
                <Tablist>
                    <Button className="small-btn">{editor.expo.status === 'stopped' ? 'Start' : 'Stop'} All</Button>
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
                        }
                    }}>{ed.status === "stopped" ? "Start" : "Stop"} </Button>
                </div>
                <div className="cli">
                    <div className="cli-content">
                        {service === 'expo' &&
                            <CactivaCli cliref={refs.expo} initialText={editor.expo.logs} />}

                        {service === 'hasura' &&
                            <CactivaCli cliref={refs.hasura} initialText={editor.hasura.logs} />}

                        {service === 'backend' &&
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