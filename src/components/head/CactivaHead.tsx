import api from "@src/libs/api";
import {
  Button,
  Icon,
  Pane,
  Popover,
  Spinner,
  Text,
  Tooltip,
  IconButton
} from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import CactivaCli from "./CactivaCli";
import "./CactivaHead.scss";

export default observer(({ editor }: any) => {
  const current = editor.current;
  const loadingText = [
    "moving",
    "deleting",
    "renaming",
    "creating",
    "duplicating",
    "loading",
    "saving"
  ];
  const infoText = ["changes applied"];
  const warningText = ["unsaved"];
  const readyText = ["ready"];
  const path =
    (current && current.path.substr(5, current.path.length - 9)) || "";
  let status = editor.status;
  if (editor.current && !editor.current.isSaved && status === "ready") {
    status = "unsaved";
  }
  const meta = useObservable({
    logText: "",
    url: ""
  });
  const timercli = useRef(null as any);
  const streamCLILog = () => {
    const exec = async () => {
      const res = await api.get("project/log-server");
      if (res.indexOf("Webpack on port") >= 0) {
        meta.url = `http://localhost:${res
          .split("Webpack on port")[1]
          .split("in")[0]
          .trim()}`;
      }
      meta.logText += res;
      terminal.current.write(res);
    };
    exec();
    timercli.current = setInterval(exec, 500);
  };
  const terminal = useRef(null as any);

  return (
    <div className="cactiva-head">
      <div className="left">
        <Popover
          onCloseComplete={() => {
            if (timercli.current) {
              clearInterval(timercli.current);
            }
          }}
          onOpenComplete={() => {
            if (editor.cli.status === "running") {
              streamCLILog();
            }
          }}
          content={
            <div className="project-popover">
              <div className="console">
                <CactivaCli cliref={terminal} initialText={meta.logText} />
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
                      terminal.current.clear();
                    })();
                  }}
                >
                  {editor.cli.status === "running"
                    ? "Stop Server"
                    : "Start Server"}
                </Button>

                {meta.url ? (
                  <a href={meta.url} target="_blank">
                    <Text size={300}>Web Preview</Text>
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
          }
          position="right"
        >
          <Pane>
            <div className="project">
              <Text size={300}>{_.startCase(editor.name)}</Text>
              <div className="status">
                <Text size={300}>{_.startCase(editor.cli.status)}</Text>
              </div>
            </div>
          </Pane>
        </Popover>
      </div>
      <div className="center">
        <Text
          style={{
            fontSize: "10px",
            fontWeight: 500,
            color: "#888",
            display: "flex",
            alignItems: "center"
          }}
        >
          {loadingText.indexOf(status) >= 0 && (
            <Spinner size={12} marginLeft={"0px"} marginRight={"3px"} />
          )}
          {warningText.indexOf(status) >= 0 && (
            <div style={{ margin: "-7px 3px 0px 2px", height: 12, width: 12 }}>
              <Icon icon="warning-sign" size={11} color="#999" />
            </div>
          )}
          {infoText.indexOf(status) >= 0 && (
            <div style={{ margin: "-5px 3px 0px 0px", height: 12, width: 12 }}>
              <Icon icon="info-sign" size={10} color="#999" />
            </div>
          )}
          {readyText.indexOf(status) >= 0 && (
            <div style={{ margin: "-5px 3px 0px 0px", height: 12, width: 12 }}>
              <Icon icon="tick-circle" size={10} color="#999" />
            </div>
          )}
          {status.charAt(0).toUpperCase() + status.slice(1)}
          {loadingText.indexOf(status) >= 0 && "…"}
        </Text>
        <Text style={{ fontSize: "9px", color: "#aaa" }}>
          {current ? path.split("/").pop() : ""}
        </Text>
      </div>
      <div className="right">
        <Tooltip content="Undo" position={"bottom"}>
          <Button
            className="btn"
            onClick={() => {
              editor.current.history.undo();
            }}
          >
            <Icon icon="undo" size={12} />
            <div className="badge">{editor.current.undoStack.length}</div>
          </Button>
        </Tooltip>
        <Tooltip content="Redo" position={"bottom"}>
          <Button
            className="btn"
            onClick={() => {
              editor.current.history.redo();
            }}
          >
            <Icon icon="redo" size={12} />
          </Button>
        </Tooltip>
        <Tooltip content="Traits" position={"bottom"}>
          <IconButton
            icon="contrast"
            className={`btn ${editor.current.traitPane ? "active-pane" : ""}`}
            onClick={() => {
              editor.current.traitPane = !editor.current.traitPane;
              localStorage.setItem(
                "cactiva-editor-trait-visible",
                editor.current.traitPane ? "y" : "n"
              );
            }}
          />
        </Tooltip>
      </div>
    </div>
  );
});
