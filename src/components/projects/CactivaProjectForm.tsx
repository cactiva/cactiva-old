import api from "@src/libs/api";
import { Button, TextInputField } from "evergreen-ui";
import React from "react";
import "./Start.scss";
import { observer } from "mobx-react-lite";

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
            <TextInputField label={"Username"} value={form.db.username} onChange={(e: any) => {
                form.db.username = (e.target.value);
            }} flexBasis={80} />
            <TextInputField label={"Password"} value={form.db.password} onChange={(e: any) => {
                form.db.password = (e.target.value);
            }} flexBasis={80} marginLeft={10} />
            <TextInputField label={"Database Name"} value={form.db.name} onChange={(e: any) => {
                form.db.name = (e.target.value);
            }} flex={1} marginLeft={10} />
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