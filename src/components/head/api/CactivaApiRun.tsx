import { fontFamily } from "@src/App";
import { evalExpression, evalExpressionInObj } from "@src/components/editor/CactivaExpressionDialog";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import { parseValue } from "@src/components/editor/utility/parser/parser";
import Axios from "axios";
import { Badge, Button, Spinner } from 'evergreen-ui';
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
                fontFamily: fontFamily,
                fontSize: 10,
                outline: 0,
            }} onKeyDown={(e) => { if (e.which === 13) runApi(meta, r.url) }} />
            {r.loading ? <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', fontSize: 8 }}><Spinner size={12} marginRight={3} />Loading</div> :
                <span>
                    <Button style={{ fontSize: 8 }} marginRight={5} height={17} onClick={(e: any) => { runApi(meta, r.url) }}>Send</Button>
                    <Badge color={r.statusCode === 200 ? 'green' : 'red'} style={{ fontSize: 8 }}>
                        {r.statusCode} {r.statusCode === 200 ? 'Ok' : 'Error'}
                    </Badge>
                </span>
            }
        </div>
        <div style={{ position: "absolute", top: 30, left: 0, right: 0, bottom: 0 }}>
            <Split
                sizes={[15, 85]}
                gutterSize={5}
                minSize={50}
                gutterAlign="center"
                snapOffset={0}
                expandToMin={false}
                direction="vertical"
                style={{ height: '100%' }}
            >
                <div style={{ borderBottom: "1px solid #ccc", position: 'relative', padding: '0px 10px' }}>
                    <Badge style={{ fontSize: 8, position: 'absolute', top: 0, right: 10 }}>Received Headers</Badge>
                    <code style={{
                        whiteSpace: 'pre-wrap', fontSize: 9, overflowY: 'auto',
                        position: "absolute", top: 0, left: 10, right: 0, bottom: 0
                    }}>
                        {r.headers}
                    </code>
                </div>
                <div style={{ position: 'relative', padding: '0px 10px' }}>
                    <Badge style={{ fontSize: 8, position: 'absolute', top: 0, right: 10 }}>Result</Badge>
                    <code style={{
                        whiteSpace: 'pre-wrap', fontSize: 9, overflowY: 'auto',
                        position: "absolute", top: 0, left: 10, right: 0, bottom: 0
                    }}>
                        {r.body}
                    </code>
                </div>
            </Split>
        </div>
    </div>
})
const serialize = function (obj: any) {
    var str = [];
    for (var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    return str.join("&");
}
export const runApi = async (meta: any, forceUrl?: string) => {
    const value = parseValue(meta.current.source);
    value.url = generateSource(_.get(meta, 'current.source.value.url'));
    const call = (Axios as any)[value.method];

    let url = forceUrl ? forceUrl : await evalExpression(value.url, { local: false, useCache: false }) || "";
    const qstring = await evalExpressionInObj(value.queryString, { local: false, useCache: true });
    const params = serialize(qstring);
    
    if (params) {
        if (url.indexOf("?") >= 0) {
            url = url + params;
        } else {
            url = url + "?" + params;
        }
    }
    meta.current.result.url = url;
    meta.current.result.loading = true;
    meta.current.result.body = "Sending...";
    meta.current.result.headers = "Sending...";
    try {
        let res = null as any;
        const headers = await evalExpressionInObj(value.headers, { local: false, useCache: true });

        if (['get', 'delete', 'head', 'options'].indexOf(value.method) >= 0)
            res = await call(url, {
                headers
            });
        else
            res = await call(url, meta.current.body, {
                headers
            });

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