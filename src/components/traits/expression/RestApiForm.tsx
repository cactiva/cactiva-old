import React from 'react';
import "./RestApiForm.scss";
import { observer, useObservable } from 'mobx-react-lite';
import { SelectMenu, IconButton, TextInput, Button, Icon } from 'evergreen-ui';
import _ from "lodash";

export default observer(() => {
    const meta = useObservable({
        method: 'get' as any,
        url: ''
    });
    return <div className="rest-api-form">
        <div className="first">
            <TextInput value={meta.url} style={{ flex: 1 }} placeholder="URL" onChange={(e: any) => {
                meta.url = e.target.value;
            }} />
            <SelectMenu
                hasFilter={false}
                height={170}
                width={180}
                closeOnSelect={true}
                onSelect={(e) => {
                    meta.method = e.value;
                    console.log(e);
                }}
                hasTitle={false}
                options={
                    ['Get', 'Post', 'Put', 'Head', 'Delete', 'Patch', 'Options']
                        .map(label => ({ label, value: label.toLowerCase() }))
                }
            >
                <Button
                    marginLeft={10}
                >{_.startCase(meta.method)} <Icon icon="caret-down" /></Button>
            </SelectMenu>
        </div>
        <div>


        </div>
    </div>
})