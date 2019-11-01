import { evalExpression } from "@src/components/editor/CactivaExpressionDialog";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import { parseValue } from "@src/components/editor/utility/parser/parser";
import Axios from "axios";
import { Badge, Spinner, Button } from 'evergreen-ui';
import _ from "lodash";
import { observer } from "mobx-react-lite";
import React from "react";
import Split from "react-split";

export default observer(({ meta }: any) => {
    const r = meta.current.result;
    return <div style={{ display: "flex", fontSize: '11px', flex: 1, flexDirection: "column" }}>
        <div style={{ borderBottom: "1px solid #ccc", flexBasis: 25, padding: '0px 5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input type={"text"} value={r.url} onChange={(e: any) => {
                r.url = e.target.value
            }} style={{
                flex: 1,
                border: 0,
                padding: '0px 5px',
                fontFamily: '"SF UI Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                fontSize: 10,
                outline: 0,
            }} />
            {r.loading ? <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', fontSize: 8 }}><Spinner size={12} marginRight={3} />Loading</div> :
                <span>
                    <Button style={{ fontSize: 8 }} marginRight={5} height={17} onClick={(e: any) => { runApi(meta, r.url) }}>Send</Button>
                    <Badge color={r.statusCode === 200 ? 'green' : 'red'} style={{ fontSize: 8 }}>
                        {r.statusCode} {r.statusCode === 200 ? 'Ok' : 'Error'}
                    </Badge>
                </span>
            }
        </div>
        <Split
            sizes={[35, 65]}
            gutterSize={5}
            gutterAlign="center"
            snapOffset={0}
            direction="vertical"
            style={{ flex: 1 }}
        >
            <div style={{ overflowY: 'auto', borderBottom: "1px solid #ccc", position: 'relative', padding: '0px 10px'  }}>
                <Badge style={{ fontSize: 8, position: 'absolute', top: 10, right: 10 }}>Headers</Badge>
                <code style={{ whiteSpace: 'pre-wrap', fontSize: 9}}>
                    {r.headers}
                </code>
            </div>
            <div style={{ position: 'relative', padding: '0px 10px'  }}>
                <Badge style={{ fontSize: 8, position: 'absolute', top: 10, right: 10 }}>Result</Badge>
                <code style={{ whiteSpace: 'pre-wrap', fontSize: 9 }}>
                    {r.body}
                </code>
            </div>
        </Split>
    </div>
})

export const runApi = async (meta: any, forceUrl?: string) => {
    const value = parseValue(meta.current.source);
    value.url = generateSource(_.get(meta, 'current.source.value.url'));
    const call = (Axios as any)[value.method];
    const url = forceUrl ? forceUrl : await evalExpression(value.url);
    meta.current.result.url = url;
    meta.current.result.loading = true;
    meta.current.result.body = "Sending...";
    meta.current.result.headers = "Sending...";
    try {
        const res = await call(url);
        meta.current.result.loading = false;
        meta.current.result.statusCode = res.status;
        meta.current.result.body = JSON.stringify(res.data, null, 2);
        meta.current.result.headers = JSON.stringify(res.headers, null, 2);
    } catch (e) {
        const res = e.response;
        meta.current.result.loading = false;
        meta.current.result.statusCode = res.status;
        meta.current.result.body = JSON.stringify(res.data, null, 2);
        meta.current.result.headers = JSON.stringify(res.headers, null, 2);
    }
}