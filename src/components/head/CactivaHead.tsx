import { Button, Dialog, Icon, IconButton, Pane, Spinner, Text, Tooltip } from "evergreen-ui";
import _ from "lodash";
import { observer } from "mobx-react-lite";
import React from "react";
import "./CactivaDialogEditor.scss";
import "./CactivaHead.scss";
import CactivaProject from "./project/CactivaProject";
import CactivaStoreEditor from "./store/CactivaStoreEditor";

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
  const onClickPane = () => {
    editor.current.traitPane = !editor.current.traitPane;
    localStorage.setItem(
      "cactiva-editor-trait-visible",
      editor.current.traitPane ? "y" : "n"
    );
  };
  return (
    <div className="cactiva-head">
      <div className="left">
        <Pane
          onClick={() => {
            editor.modals.project = true;
          }}
        >
          <div className="project">
            <Text size={300}>{_.startCase(editor.name)}</Text>
            <div className="status">
              <Text size={300}>Loaded</Text>
            </div>
          </div>
        </Pane>

        <Dialog
          isShown={editor.modals.project}
          hasFooter={false}
          width={810}
          minHeightContent={540}
          hasHeader={false}
          shouldCloseOnEscapePress={false}
          contentContainerProps={{
            style: { display: "flex" }
          }}
          onCloseComplete={() => (editor.modals.project = false)}
        >
          <CactivaProject />
        </Dialog>

        <div
          className="cactiva-head-divider"
          style={{ margin: "0px 4px 0px 10px" }}
        />
        <Tooltip content="Store Variable" position={"bottom"}>
          <IconButton
            icon="box"
            iconSize={14}
            className={`btn`}
            onClick={() => {
              editor.modals.store = true;
            }}
          />
        </Tooltip>
        <Dialog
          isShown={editor.modals.store}
          hasFooter={false}
          width={800}
          minHeightContent={600}
          shouldCloseOnEscapePress={false}
          shouldCloseOnOverlayClick={false}
          hasHeader={false}
          contentContainerProps={{
            style: { display: "flex" }
          }}
          onCloseComplete={() => (editor.modals.store = false)}
        >
          <CactivaStoreEditor />
        </Dialog>
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
          {status === "unsaved" && (
            <span style={{ marginLeft: "3px", fontSize: "8px" }}>
              (Ctrl/⌘+S)
            </span>
          )}
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
        <div
          className="cactiva-head-divider"
          style={{ margin: "0px 8px 0px 7px" }}
        />
        <Tooltip content="Style &amp; Props" position={"bottom"}>
          <IconButton
            icon="column-layout"
            className={`btn ${editor.current.traitPane ? "active-pane" : ""}`}
            onClick={onClickPane}
          />
        </Tooltip>
      </div>
    </div>
  );
});
