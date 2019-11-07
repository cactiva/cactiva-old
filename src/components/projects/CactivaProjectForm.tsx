import api from "@src/libs/api";
import { Button, TextInputField, Icon } from "evergreen-ui";
import React from "react";
import "./Start.scss";
import { observer, useObservable } from "mobx-react-lite";

export default observer(({ form, onCancel, onSubmit, disable = [] }: any) => {
    return <div className="projects">
        <TextInputField label={"Name"} disabled={disable.indexOf('name') >= 0}
            value={form.name} onChange={(e: any) => {
                form.name = (e.target.value).toLowerCase().replace(/[^0-9a-zA-Z-_]/g, '');
            }} />
        <div style={{ display: "flex", flexDirection: "row" }}>
            <TextInputField label={"Database Host"} value={form.db.host} onChange={(e: any) => {
                form.db.host = (e.target.value);
            }} flex={1} />
            <TextInputField label={"Port"} value={form.db.port} onChange={(e: any) => {
                form.db.port = (e.target.value);
            }} flexBasis={80} marginLeft={10} />
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
            <TextInputField label={"Username"} value={form.db.user} onChange={(e: any) => {
                form.db.user = (e.target.value);
            }} flexBasis={80} />
            <TextInputField label={"Password"} value={form.db.password} onChange={(e: any) => {
                form.db.password = (e.target.value);
            }} flexBasis={80} marginLeft={10} />
            <TextInputField label={"Database Name"} value={form.db.database} onChange={(e: any) => {
                form.db.database = (e.target.value);
            }} flex={1} marginLeft={10} />

            <Button marginLeft={10} marginTop={24} onClick={async () => {
                const res = await api.post("project/test-db", form.db);
                if (res.status !== 'ok') {
                    alert(res.status + '\n' + (res.reason || ""));
                } else {
                    alert("Database Connected!");
                }
            }}>Test Db <Icon icon={"swap-horizontal"} size={14} marginLeft={5} /></Button>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
            <TextInputField label={"API Host"} value={form.apiUrl} onChange={(e: any) => {
                form.apiUrl = (e.target.value);
            }} flex={1} />
            <TextInputField label={"Hasura Secret"} value={form.hasuraSecret} onChange={(e: any) => {
                form.hasuraSecret = (e.target.value);
            }} flex={1} marginLeft={10} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
            {onCancel && <Button marginRight={10} onClick={onCancel}>Cancel</Button>}
            {onSubmit && <Button intent="success" appearance={"primary"} onClick={onSubmit}>Create New</Button>}
        </div>
    </div>
})