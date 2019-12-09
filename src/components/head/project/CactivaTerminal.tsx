import api from "@src/libs/api";
import editor from "@src/store/editor";
import _ from "lodash";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import CactivaCli from "../CactivaCli";
import "./CactivaProject.scss";

export interface CactivaTerminalProps {
    connected: boolean
    name: string
    id: string
    ws: any
    lastId: string,
    buffer: string,
    onKeyListener: any
}

export default observer(({ meta, style, saveTabs }: { meta: CactivaTerminalProps, style?: any, saveTabs: any; }) => {
    const cli = useRef(null as any);
    useEffect(() => {
        if (!meta) return;
        const connectWs = _.debounce((terminal: any, onConnectText: string) => {
            meta.connected = true;
            meta.name = editor.name;
            meta.ws = new WebSocket((api.wsUrl + "pty"));
            meta.ws.onopen = (e: any) => {
                meta.ws.send("start|" + editor.name + `${meta.id ? `|${meta.id}` : ''}`);
            };
            meta.ws.onclose = () => {
                meta.connected = false;
            }
            let sent = false;
            meta.ws.onmessage = (e: any) => {
                if (!meta.id) {
                    meta.id = e.data;
                    saveTabs(meta.id);
                } else {
                    if (!sent && onConnectText) {
                        meta.ws.send(onConnectText);
                        sent = true;
                    }
                    meta.connected = true;
                    terminal.writeUtf8(e.data);
                    meta.buffer += e.data;
                }
            };

        }, 300);
        const disconnectWs = () => {
            meta.name = '';
            meta.id = '';

            if (meta.ws) {
                if (meta.ws) {
                    try {
                        meta.ws.close();
                    } catch (e) { }
                }
                meta.ws = null;
                meta.connected = false;
            }
        }
        if (meta.name !== editor.name) {
            if (meta.id && meta.name) {
                meta.lastId = meta.id;
            }
            disconnectWs();
            if (meta.lastId) {
                meta.id = meta.lastId;
            }
            saveTabs(meta.id);
        }

        const terminal = cli.current;
        terminal.clear();
        terminal.writeUtf8(meta.buffer || '');
        if (!meta.ws || (meta.ws && (meta.ws.readyState === WebSocket.CLOSED || meta.ws.readyState === WebSocket.CLOSING))) {
            connectWs(terminal, "");
        }
        let tempKey = "";
        terminal.attachCustomKeyEventHandler((e: any) => {
            if (e.key === 'v' && e.ctrlKey) {
                const paste = prompt("Paste Here:");
                if (paste) {
                    meta.ws.send(paste);
                }
            }
        });

        if (meta.onKeyListener && meta.onKeyListener.dispose) {
            meta.onKeyListener.dispose();
        }

        meta.onKeyListener = terminal.onKey((e: { key: string }) => {
            if (!meta.connected) {
                tempKey += e.key;
                connectWs(terminal, tempKey);
            } else {
                meta.ws.send(e.key);
            }
        })

    }, [meta]);
    if (!meta) return null;
    return <CactivaCli cliref={cli} style={style} />;
});