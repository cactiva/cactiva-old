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
  name: '',
  id: '',
  ws: null as any,
  loaded: {} as any,
});
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
    } else {
      if (!sent && onConnectText) {
        meta.ws.send(onConnectText);
        sent = true;
      }
      meta.connected = true;
      terminal.writeUtf8(e.data);
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

export default observer(() => {
  const cli = useRef(null as any);
  useEffect(() => {
    console.log(meta.name, editor.name);
    if (meta.name !== editor.name) {
      if (meta.id && meta.name) {
        meta.loaded[meta.name] = meta.id;
      }
      disconnectWs();
      if (meta.loaded[editor.name]) {
        meta.id = meta.loaded[editor.name];
      }
    }

    const terminal = cli.current;
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
      if (meta.ws && meta.ws.close) {
        meta.ws.close();
      }
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
          <div>
            <small style={{ fontSize: 11, color: "#ccc", marginRight: 5 }}>{meta.id}</small>
            <Button
              className="small-btn"
              onClick={async () => {
                if (confirm("Your current process will be killed. Are you sure?")) {
                  if (meta.ws && meta.ws.send) {
                    meta.ws.send("----!@#!@#-CACTIVA-KILL-PAYLOAD-!@#!@#---");
                    disconnectWs();
                    const terminal = cli.current;
                    terminal.clear();
                    connectWs(terminal, "");
                  }
                }
              }}
            >
              Reset
            </Button></div>
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
