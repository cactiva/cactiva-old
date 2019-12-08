import { fontFamily } from "@src/App";
import CactivaProjectForm from "@src/components/projects/CactivaProjectForm";
import api from "@src/libs/api";
import editor from "@src/store/editor";
import { Button, Dialog, IconButton } from "evergreen-ui";
import _ from "lodash";
import { observable } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import CactivaCli from "../CactivaCli";
import "./CactivaProject.scss";
const meta = observable({
  edit: false,
  connected: false,
  ws: null as any
});
const connectWs = _.debounce((terminal: any, onConnectText: string) => {
  meta.connected = true;
  meta.ws = new WebSocket((api.wsUrl + "pty"));
  meta.ws.onopen = (e: any) => {
    meta.ws.send("start|1|" + editor.name);
  };
  meta.ws.onclose = () => {
    meta.connected = false;
  }
  let sent = false;
  meta.ws.onmessage = (e: any) => {
    if (!sent && onConnectText) {
      meta.ws.send(onConnectText);
      sent = true;
    }
    meta.connected = true;
    terminal.writeUtf8(e.data);
  };
}, 300);

export default observer(() => {
  const cli = useRef(null as any);
  useEffect(() => {
    const terminal = cli.current;
    api.wsUrl
    terminal.clear();

    connectWs(terminal, "");
    let tempKey = "";
    terminal.attachCustomKeyEventHandler((e: any) => {
      if (e.key === 'v' && e.ctrlKey) {
        const paste = prompt("Paste Here:");
        if (paste) {
          meta.ws.send(paste);
        }
      }
    });
    terminal.onKey((e: { key: string }) => {
      if (!meta.connected) {
        tempKey += e.key;
        connectWs(terminal, tempKey);
      } else {
        meta.ws.send(e.key);
      }
    })

    return () => {
      meta.ws.close();
    }
  }, []);
  return (
    <div className="cactiva-dialog-editor">
      <div className="cactiva-project" style={{ fontFamily: fontFamily }}>
        <div className="header">
          <div className="project">
            {_.startCase(editor.name)}
            <IconButton
              icon={"edit"}
              className="small-btn"
              style={{ marginRight: 0, padding: "0px 5px" }}
              onClick={async () => {
              }}
            />
            <Button
              className="small-btn"
              onClick={async () => {
                editor.path = "";
                editor.name = "";
              }}
            >
              Switch
            </Button>
            {editor.previewUrl !== "" && (
              <Button
                className="small-btn"
                onClick={() => {
                  const win = window.open(
                    editor.previewUrl +
                    editor.path.substr(4, editor.path.length - 8),
                    "_blank"
                  );
                  if (win) win.focus();
                }}
              >
                Preview App
              </Button>
            )}
          </div>
        </div>
        <div className="content">
          <CactivaCli cliref={cli} style={{ background: 'red', height: 200 }} />
        </div>
      </div>

      <Dialog
        isShown={meta.edit}
        onConfirm={async () => {
          await api.post("project/edit-project", editor.settings);
          meta.edit = false;
        }}
        onCloseComplete={() => {
          meta.edit = false;
        }}
        title="Edit Project"
      >
        <CactivaProjectForm form={editor.settings} disable={["name"]} />
      </Dialog>
    </div>
  );
});
