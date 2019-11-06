import api from "@src/libs/api";
import { Dialog, Icon, Text } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import MonacoEditor from "react-monaco-editor";
import Split from "react-split";
import CactivaBreadcrumb from "./CactivaBreadcrumb";
import CactivaComponentChooser, { toolbar } from "./CactivaComponentChooser";
import CactivaExpressionDialog from "./CactivaExpressionDialog";
import "./editor.scss";
import "./tags/kinds/kinds.scss";
import "./tags/react-native/react-native.scss";
import "./tags/ui-kitten/ui-kitten.scss";
import { addChildInId, commitChanges, createNewElement, getParentId, insertAfterElementId, prepareChanges, wrapInElementId } from "./utility/elements/tools";
import { renderChildren } from "./utility/renderchild";
import tags from "./utility/tags";
import CactivaCustomComponent from "./CactivaCustomComponent";
import ed from "@src/store/editor";

export default observer(({ editor }: any) => {
  const meta = useObservable({
    onDrag: false,
    edHeight: parseInt(
      localStorage.getItem("cactiva-editor-source-height") || "40"
    )
  });
  const sourceRef = useRef(null as any);
  const monacoEdRef = useRef(null as any);
  const screenSize = [100 - meta.edHeight, meta.edHeight];
  const onDragScreen = (e: any) => {
    if (sourceRef.current) {
      const h = parseInt(
        sourceRef.current.style.height
          .replace("calc(", "")
          .replace("% - 2.5px)")
      );

      if (!isNaN(h)) {
        localStorage.setItem("cactiva-editor-source-height", h + "");
      }
    }
    if (monacoEdRef.current) {
      monacoEdRef.current.layout();
    }
  };
  return (
    <div className="cactiva-editor">
      <div className="cactiva-wrapper">
        <div className="cactiva-editor-wrapper">
          <Split
            sizes={screenSize}
            gutterSize={5}
            gutterAlign="center"
            dragInterval={1}
            direction="vertical"
            className={`cactiva-editor-content ${
              editor.jsx
                ? editor.rootSelected
                  ? "resplit"
                  : "split"
                : "unsplit"
              }`}
            onDrag={onDragScreen}
          >
            <CactivaEditorRender editor={editor} />
            <div
              className={`cactiva-editor-source `}
              ref={sourceRef}
              style={{ display: editor.jsx ? "flex" : "none" }}
            >
              <CactivaEditorSource
                editor={editor}
                meta={meta}
                monacoEdRef={monacoEdRef}
              />
            </div>
          </Split>
        </div>
      </div>
      <CactivaEditorFooter editor={editor} />
      <CactivaEditorAddComponent editor={editor} />
      {ed.modals.expression && <CactivaExpressionDialog />}
      {ed.modals.customComponents && <CactivaCustomComponent />}
    </div>
  );
});
const CactivaEditorRender = observer((props: any) => {
  const { editor } = props;
  const children = renderChildren(
    { name: "--root--", children: [editor.source] },
    editor
  );
  return <div className="cactiva-canvas">{children}</div>;
});
const CactivaEditorSource = observer((props: any) => {
  const { editor, monacoEdRef } = props;
  const meta = useObservable({
    sourceLanguage: "javascript",
    showAction: true,
    selectedSource: "",
    listenEditorChanges: false
  });
  const monacoRef = useRef(null as any);
  const isSelected = !!editor.rootSelected || !!editor.selectedId;
  const sourceLangClick = () => {
    if (!editor.rootSelected) {
      meta.sourceLanguage =
        meta.sourceLanguage === "json" ? "javascript" : "json";
    }
  };
  const editorWillMount = (monaco: any) => {
    editor.setupMonaco(monaco);
    monacoRef.current = monaco;
  };
  const editorDidMount = (ed: any, monaco: any) => {
    monacoEdRef.current = ed;
    ed.onDidBlurEditorText(function (e: any) {
      monacoEditorChange(ed.getValue());
    });
    ed.onMouseLeave(function (e: any) {
      monacoEditorChange(ed.getValue());
    });
    ed.addAction({
      id: "cactiva-apply-changes",
      label: "Apply Changes",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: function (ed: any) {
        meta.showAction = false;
        monacoEditorChange(ed.getValue());
        if (editor.selectedSource.length > 0) {
          editor.applySelectedSource(true);
        } else {
          meta.showAction = true;
        }

        return null;
      }
    });
    ed.addAction({
      id: "cactiva-save",
      label: "Save",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
      run: function (ed: any) {
        monacoEditorChange(ed.getValue());
        editor.save();
        return null;
      }
    });
  };
  const monacoEditorChange = _.debounce(
    value => {
      if (meta.listenEditorChanges) {
        if (value !== editor.selectedSource) {
          editor.selectedSource = value;

          const ed = monacoEdRef.current;
          if (!ed.getModel().canUndo()) {
            editor.selectedSource = "";
          }
        }
      }
    },
    100,
    {
      leading: true
    }
  );
  const reloadEditorSource = (resetUndo = true) => {
    try {
      if (editor.rootSelected) {
        meta.selectedSource = editor.getSourceCode();
        meta.sourceLanguage = "javascript";
        editor.jsx = true;
      } else {
        if (meta.sourceLanguage === "json") {
          meta.selectedSource = JSON.stringify(editor.selected.source, null, 2);
        } else {
          meta.selectedSource = editor.getSelectedSourceCode();
        }
      }
    } catch (e) {
      console.log(e);
    }
    if (monacoEdRef.current) {
      const activeEditor = monacoEdRef.current;
      const currentPosition = activeEditor.getPosition();
      meta.listenEditorChanges = false;
      if (resetUndo) {
        monacoEdRef.current.setValue(meta.selectedSource);
      } else {
        const monaco = monacoRef.current;
        activeEditor.executeEdits("beautifier", [
          {
            identifier: "delete" as any,
            range: new monaco.Range(1, 1, 10000, 1),
            text: "",
            forceMoveMarkers: true
          }
        ]);
        activeEditor.executeEdits("beautifier", [
          {
            identifier: "insert" as any,
            range: new monaco.Range(1, 1, 1, 1),
            text: meta.selectedSource,
            forceMoveMarkers: true
          }
        ]);
        activeEditor.setSelection(new monaco.Range(0, 0, 0, 0));
      }
      monacoEdRef.current.layout();
      meta.listenEditorChanges = true;
      activeEditor.setPosition(currentPosition);
    }
    meta.showAction = true;
  };
  useEffect(reloadEditorSource, [
    editor.selectedId,
    editor.rootSelected,
    meta.sourceLanguage,
    editor.jsx,
    editor.undoStack.length
  ]);
  if (isSelected && editor.jsx) {
    let Action = () => (
      <div className="action-toolbar">
        <div
          className="action-btn"
          style={{ padding: 0, opacity: 0.7, border: 0 }}
        >
          {!editor.rootSelected ? <Text>Apply Changes: Ctrl / ⌘ + Enter</Text> : <Text>Raw Source (Save Ctrl / ⌘ + S)</Text>}
        </div>
      </div>
    );
    if (!editor.rootSelected && editor.selectedSource.length > 0 && meta.showAction) {
      const actionClick = () => {
        reloadEditorSource(false);
        monacoEdRef.current.setValue(meta.selectedSource);
        editor.selectedSource = "";
      };
      Action = () => (
        <div className="action-toolbar">
          <div
            className="action-btn green"
            onClick={() => editor.applySelectedSource()}
          >
            <Icon icon="small-tick" size={12} />
            <Text>Apply Changes [ Ctrl / ⌘ + Enter ] </Text>
          </div>
          <div className="action-btn red" onClick={actionClick}>
            <Icon icon="small-cross" size={12} />
            <Text>Discard</Text>
          </div>
        </div>
      );
    }
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%"
        }}
      >
        <div
          className="editor-source-action"
          style={{
            paddingTop: editor.rootSelected ? 6 : undefined
          }}
        >
          <Action />
          <div
            style={{
              width: 15,
              height: 8,
              border: "1px solid #ccc",
              opacity: 0.3,
              borderRadius: 3,
              cursor: "pointer",
              background: meta.sourceLanguage === "json" ? "white" : undefined
            }}
            onClick={sourceLangClick}
          ></div>
        </div>
        <MonacoEditor
          theme="vs-dark"
          options={{ fontSize: 11 }}
          editorWillMount={editorWillMount}
          editorDidMount={editorDidMount}
          language={meta.sourceLanguage}
        />
      </div>
    );
  }
  return (
    <div className="empty">
      <Icon icon="select" color="white" size={30} />
      <Text color="white" marginTop={10} size={300}>
        Please select a component
      </Text>
    </div>
  );
});

const CactivaEditorFooter = observer((props: any) => {
  const { editor } = props;
  const { jsx } = editor;
  const btnSourceClick = () => {
    editor.jsx = !jsx;
    if (jsx === false) {
      editor.rootSelected = false;
      editor.selectedSource = "";
    }
  };

  useEffect(() => {
    localStorage.setItem("cactiva-editor-source-visible", jsx ? "y" : "n");
  }, [jsx]);

  return (
    <div className="cactiva-editor-footer">
      <CactivaBreadcrumb editor={editor} />
      <div
        className={`toggle-jsx ${jsx ? "active" : ""}`}
        onClick={btnSourceClick}
      >
        <Icon icon={jsx ? "eye-off" : "eye-open"} size={12} />
        <div style={{ marginLeft: 5 }}>Code</div>
      </div>
    </div>
  );
});
const CactivaEditorAddComponent = observer((props: any) => {
  const { editor } = props;
  const meta = useObservable({
    toolbar: [] as any[]
  });
  const compInfo = editor.addComponentInfo;
  const onCloseDialog = () => {
    editor.addComponentInfo = null;
  };
  let title = "Add Component";
  let status = "add";
  let icon = "plus";
  if (compInfo) {
    status = compInfo.status;
    icon = compInfo.status === "add" ? "plus" : "add-to-folder";
    title = compInfo.status === "add" ? "Add Component" : "Wrap in Component";
  }
  const addHandle = async (value: any) => {
    let newEl = await createNewElement(value);
    if (newEl) {
      prepareChanges(editor);
      if (compInfo.placement === "after") {
        insertAfterElementId(editor.source, compInfo.id, newEl);
      } else {
        addChildInId(editor.source, compInfo.id, newEl);
      }
      commitChanges(editor);
    }
  };
  const wrapHandle = async (value: any) => {
    let newEl = await createNewElement(value);
    if (newEl) {
      prepareChanges(editor);
      wrapInElementId(editor.source, compInfo.id, newEl);
      commitChanges(editor);
    }
  };
  const filterToolbar = () => {
    return toolbar.filter((item: any) => {
      const tag: any = tags[item.label];
      const kind: any = tags[item.label];
      if (!tag && !kind) return false;
      if (!!tag.insertTo || !!kind.insertTo) return true;
      return false;
    });
  };

  useEffect(() => {
    meta.toolbar = filterToolbar();
  }, []);

  return (
    <Dialog
      isShown={!!compInfo}
      hasHeader={false}
      hasFooter={false}
      preventBodyScrolling
      onCloseComplete={onCloseDialog}
      minHeightContent={400}
      width={400}
    >
      <CactivaComponentChooser
        title={title}
        icon={icon}
        items={status === "add" ? [] : meta.toolbar}
        onSelect={(value: any) => {
          if (status === "add") {
            addHandle(value);
          } else {
            wrapHandle(value);
          }
          editor.addComponentInfo = null;
        }}
      />
    </Dialog>
  );
});
export const showAddInParent = (cactiva: any) => {
  if (cactiva.source.id === cactiva.editor.selectedId) {
    return true;
  }
  if (getParentId(cactiva.editor.selectedId) === cactiva.source.id) {
    return cactiva.source.id;
  }
};
