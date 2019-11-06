import React from "react";
import "./CactivaProjectInfo.scss";
import { Text, Button } from "evergreen-ui";
import editor from "@src/store/editor";
import _ from "lodash";

export default () => {
    return <div className="project-info">
        <Text size={500} style={{ fontWeight: 'bold' }}>{_.startCase(editor.name)}</Text>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
            <Text size={300} style={{ fontSize: 10 }}>{_.startCase(editor.cli.status)}</Text>
            <Button
                onClick={() => {
                    editor.path = '';
                    editor.name = '';
                }}
                lineHeight={'20px'}
                height={'20px'}
                padding={'0px'}
                fontSize={10}>
                <div style={{ padding: '0px 5px' }}>
                    Switch Project
            </div></Button>
        </div>
        <hr style={{ border: '0px', borderTop: '1px solid #ccc' }} />
    </div>
}