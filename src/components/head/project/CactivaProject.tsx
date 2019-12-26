import { fontFamily } from "@src/App";
import CactivaProjectForm from "@src/components/projects/CactivaProjectForm";
import api from "@src/libs/api";
import editor from "@src/store/editor";
import { Button, Dialog, IconButton, Tab } from "evergreen-ui";
import _ from "lodash";
import { observable, toJS } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import "./CactivaProject.scss";
import CactivaTerminal, { CactivaTerminalProps } from "./CactivaTerminal";

const meta = observable({
  edit: false,
  tabIndex: 0,
  tabs: [] as CactivaTerminalProps[],
});

const saveTabs = () => {
  localStorage[`cactiva-terminal-tabs`] = JSON.stringify(meta.tabs.map((t) => {
    return { id: t.id, name: t.name, buffer: t.buffer };
  }));
}

export default observer(() => {
  useEffect(() => {
    if (meta.tabs.length === 0) {
      try {
        const existing = JSON.parse(localStorage['cactiva-terminal-tabs']);
        meta.tabs = existing
      } catch (e) {
        console.log(e);
      }
      if (meta.tabs.length === 0) {
        meta.tabs.push({ id: '' } as any);
      }
    }

    const i = setInterval(() => {
      saveTabs()
    }, 5000);
    return () => {
      clearInterval(i);
    }
  }, [])

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
                meta.edit = true;
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
          <div className="tabs">
            {meta.tabs.map((tab, index) => (
              <Tab key={tab.id} isSelected={meta.tabIndex === index} onSelect={() => {
                meta.tabIndex = index;
              }}>
                {tab.id ? tab.id : "Loading..."}
                <IconButton icon="small-cross" onClick={(e: any) => {
                  if (tab.ws && tab.ws.send) {
                    try {
                      tab.ws.send('----!@#!@#-CACTIVA-KILL-PAYLOAD-!@#!@#---');
                      tab.ws.kill();
                    } catch (e) {

                    }
                  }
                  meta.tabIndex = meta.tabIndex > 0 ? meta.tabIndex - 1 : 0;
                  meta.tabs.splice(index, 1);
                  saveTabs();
                  e.preventDefault();
                  e.stopPropagation();
                }} />
              </Tab>
            ))}

            <IconButton icon="small-plus" onClick={() => {
              meta.tabs.push({ id: "" } as any);
              meta.tabIndex = meta.tabs.length - 1;
              saveTabs();
            }} />
          </div>
        </div>
        <div className="content">
          {meta.tabs.map((tab, index) => {
            return <CactivaTerminal key={index} saveTabs={(id: string) => {
              saveTabs();
            }} meta={tab} style={{
              minWidth: '784px',
              height: '400px',
              opacity: index === meta.tabIndex ? 1 : 0,
              position: 'absolute'
            }} />
          })}
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
