import api from "@src/libs/api";
import { Button, Icon, Spinner, Text } from "evergreen-ui";
import { observable } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useRef } from 'react';
import CactivaCli from './CactivaCli';
import editor from "@src/store/editor";
import CactivaProjectInfo from "./CactivaProjectInfo";

const meta = observable({
    logText: "",
    url: ""
});
export const fetchCliStream = async () => {
    const res = await api.get("project/log-server");
    meta.logText += res;
    if (meta.logText.indexOf("Webpack on port") >= 0) {
        meta.url = `http://localhost:${meta.logText
            .split("Webpack on port")[1]
            .split("in")[0]
            .trim()}`;
        editor.previewUrl = meta.url
    }

    if (meta.logText.indexOf("running at exp://") >= 0) {
        const host = meta.logText.split("running at exp://")[1].split(":")[0]
        meta.url = meta.url.replace('localhost', host);
        editor.previewUrl = meta.url
    }
    return res;
}
export default observer(({ editor, cliref }: any) => {
    const timercli = useRef(null as any);
    const streamCLILog = () => {
        const exec = async () => {
            if (editor.cli.status === "running") {
                if (terminal.current)
                    terminal.current.write(await fetchCliStream());
            }
        };
        exec();
        // timercli.current = setInterval(exec, 500);
    };
    const terminal = useRef(null as any);
    if (cliref && cliref.current) {
        cliref.current = {
            timer: timercli.current,
            stream: streamCLILog
        }
    }
    return (
        <div className="project-popover">
            <div className={"project-console"}>
                <div className="console">
                    {meta.logText === "" && editor.cli.status === "stopped" ? (
                        <div className="empty">
                            <Icon icon="cell-tower" color="white" size={30} />
                            <Text color="white" marginTop={10} size={300}>
                                Please start the server
            </Text>
                        </div>
                    ) : (
                            <CactivaCli cliref={terminal} initialText={meta.logText} />
                        )}
                </div>
                <div className="commands">
                    <Button
                        size={300}
                        userSelect="none"
                        onClick={() => {
                            (async () => {
                                if (editor.cli.status === "stopped") {
                                    await api.get("project/start-server");
                                    editor.cli.status = "running";
                                    streamCLILog();
                                } else {
                                    await api.get("project/stop-server");
                                    editor.cli.status = "stopped";
                                    clearInterval(timercli.current);
                                }
                                meta.logText = "";
                                meta.url = "";
                                if (terminal.current) {
                                    terminal.current.clear();
                                }
                            })();
                        }}
                    >
                        {editor.cli.status === "running" ? "Stop Server" : "Start Server"}
                    </Button>

                    {meta.url ? (
                        <a href={meta.url} target="_blank">
                            <Text size={300}>Open Web Preview</Text>
                            <Icon icon="share" size={11} color="#999" />
                        </a>
                    ) : editor.cli.status === "running" ? (
                        <a>
                            <Spinner size={18} color="#999" />
                            <Text size={300}>Loading...</Text>
                        </a>
                    ) : (
                                <a>
                                    <Text size={300}>Preview not available</Text>
                                </a>
                            )}
                </div>
            </div>
            <CactivaProjectInfo />
        </div>
    );
});