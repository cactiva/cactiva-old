import api from "@src/libs/api";
import { Button, Icon, TextInputField } from "evergreen-ui";
import { observer } from "mobx-react-lite";
import React from "react";
import "./Start.scss";

export default observer(({ form, onCancel, onSubmit, disable = [] }: any) => {
    const db = form.db || {};
    return <div className="projects">
        <TextInputField label={"Name"} disabled={disable.indexOf('name') >= 0}
            value={form.name} onChange={(e: any) => {
                form.name = (e.target.value).toLowerCase().replace(/[^0-9a-zA-Z-_]/g, '');
            }} />
        <div style={{ display: "flex", flexDirection: "row" }}>
            <TextInputField label={"Database Host"} value={db.host} onChange={(e: any) => {
                db.host = (e.target.value);
            }} flex={1} />
            <TextInputField label={"Port"} value={db.port} onChange={(e: any) => {
                db.port = (e.target.value);
            }} flexBasis={80} marginLeft={10} />
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
            <TextInputField label={"Username"} value={db.user} onChange={(e: any) => {
                db.user = (e.target.value);
            }} flexBasis={80} />
            <TextInputField label={"Password"} value={db.password} onChange={(e: any) => {
                db.password = (e.target.value);
            }} flexBasis={80} marginLeft={10} />
            <TextInputField label={"Database Name"} value={db.database} onChange={(e: any) => {
                db.database = (e.target.value);
            }} flex={1} marginLeft={10} />

            <Button marginLeft={10} marginTop={24} onClick={async () => {
                const res = await api.post("project/test-db", db);
                if (res.status !== 'ok') {
                    alert(res.status + '\n' + (res.reason || ""));
                } else {
                    alert("Database Connected!");
                }
            }}>Test Db <Icon icon={"swap-horizontal"} size={14} marginLeft={5} /></Button>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
            <TextInputField label={"Backend Port"} value={form.backend.port} onChange={(e: any) => {
                form.backend.port = e.target.value;
            }} flex={1} />
            <TextInputField label={"Hasura Port"} value={form.hasura.port} onChange={(e: any) => {
                form.hasura.port = e.target.value;
            }} flex={1} marginLeft={10}  />
            <TextInputField label={"Hasura Secret"} value={form.hasura.secret} onChange={(e: any) => {
                form.hasura.secret = (e.target.value);
            }} flex={1} marginLeft={10} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
            {onCancel && <Button marginRight={10} onClick={onCancel}>Cancel</Button>}
            {onSubmit && <Button intent="success" appearance={"primary"} onClick={onSubmit}>Create New</Button>}
        </div>
    </div>
})