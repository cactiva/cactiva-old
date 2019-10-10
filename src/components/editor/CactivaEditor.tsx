import api from "@src/libs/api";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import MonacoEditor from "react-monaco-editor";
import Split from "react-split";
import CactivaBreadcrumb from "./CactivaBreadcrumb";
import CactivaToolbar from "./CactivaToolbar";
import "./editor.scss";
import "./tags/tags.scss";
import {
  addChildInId,
  commitChanges,
  createNewElement,
  insertAfterElementId,
  prepareChanges
} from "./utility/elements/tools";
import { Icon, Text } from "evergreen-ui";
import { generateSource } from "./utility/parser/generateSource";
import { renderChildren } from "./utility/renderchild";
import { SyntaxKind } from "./utility/syntaxkinds";
import prettier from "prettier/standalone";
import typescript from "prettier/parser-typescript";
import { toJS } from "mobx";

const uploadImage = async (file: any) => {
  var formDataToUpload = new FormData();
  formDataToUpload.append("file", file);
  return await api.post("/assets/upload", formDataToUpload, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

export default observer(({ editor }: any) => {
  const meta = useObservable({
    onDrag: false,
    jsx:
      localStorage.getItem("cactiva-editor-source-visible") === "y"
        ? true
        : false,
    sourceLanguage: "javascript",
    selectedSource: "",
    listenEditorChanges: false,
    edHeight: parseInt(
      localStorage.getItem("cactiva-editor-source-height") || "40"
    )
  });
  const children = renderChildren(
    { name: "--root--", children: [editor.source] },
    editor
  );

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

  const onDrop = useCallback(async acceptedFiles => {
    if (!acceptedFiles[0].type.includes("image/")) {
      alert("Images only!");
      return;
    }
    prepareChanges(editor);
    const el = createNewElement("Image");
    const file: any = await uploadImage(acceptedFiles[0]);
    el.props["source"] = {
      kind: SyntaxKind.CallExpression,
      value: `require('@src/assets/images/${file.filename}')`
    };
    el.props["style"] = {
      kind: SyntaxKind.ObjectLiteralExpression,
      value: {
        width: {
          kind: SyntaxKind.NumericLiteral,
          value: 250
        }
      }
    };
    if (editor.source.children.length > 0) {
      const idx = editor.source.children.length - 1;
      insertAfterElementId(editor.source, editor.source.children[idx].id, el);
    } else {
      addChildInId(editor.source, editor.source.id, el);
    }
    commitChanges(editor);
    meta.onDrag = false;
  }, []);
  const onDragEnter = () => {
    meta.onDrag = true;
  };
  const { getRootProps, getInputProps } = useDropzone({ onDrop, onDragEnter });
  const rootProps = getRootProps();
  const sourceRef = useRef(null as any);
  const monacoRef = useRef(null as any);
  const monacoEdRef = useRef(null as any);
  const isSelected = !!editor.rootSelected || !!editor.selectedId;
  delete rootProps.onDoubleClick;
  delete rootProps.onClick;

  const reloadEditorSource = (resetUndo = true) => {
    try {
      if (editor.rootSelected) {
        meta.selectedSource = editor.getSourceCode();
        meta.sourceLanguage = "javascript";
        meta.jsx = true;
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
      meta.listenEditorChanges = false;
      if (resetUndo) {
        monacoEdRef.current.setValue(meta.selectedSource);
      } else {
        const activeEditor = monacoEdRef.current;
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
    }
  };
  useEffect(reloadEditorSource, [
    editor.selectedId,
    editor.rootSelected,
    meta.sourceLanguage,
    meta.jsx,
    editor.undoStack.length
  ]);

  return (
    <div className="cactiva-editor" {...rootProps}>
      {meta.onDrag && <input {...getInputProps()} />}

      <div className="cactiva-wrapper">
        {!editor.rootSelected && <CactivaToolbar />}
        <div className="cactiva-editor-wrapper">
          <Split
            sizes={[100 - meta.edHeight, meta.edHeight]}
            gutterSize={5}
            gutterAlign="center"
            dragInterval={1}
            direction="vertical"
            className={`cactiva-editor-content ${
              meta.jsx ? (editor.rootSelected ? "resplit" : "split") : "unsplit"
            }`}
            onDrag={(e: any) => {
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
            }}
          >
            <div className="cactiva-canvas">{children}</div>
            <div
              className={`cactiva-editor-source `}
              ref={sourceRef}
              style={{ display: meta.jsx ? "flex" : "none" }}
            >
              {!isSelected ? (
                <div className="empty">
                  <Icon icon="select" color="white" size={30} />
                  <Text color="white" marginTop={10} size={300}>
                    Please select a component
                  </Text>
                </div>
              ) : (
                meta.jsx && (
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
                      {editor.selectedSource.length > 0 ? (
                        <div className="action-toolbar">
                          <div
                            className="action-btn green"
                            onClick={() => editor.applySelectedSource()}
                          >
                            <Icon icon="small-tick" size={12} />
                            <Text>Apply Changes [ Ctrl / ⌘ + Enter ] </Text>
                          </div>
                          <div
                            className="action-btn red"
                            onClick={() => {
                              reloadEditorSource(false);
                              monacoEdRef.current.setValue(meta.selectedSource);
                              editor.selectedSource = "";
                            }}
                          >
                            <Icon icon="small-cross" size={12} />
                            <Text>Discard</Text>
                          </div>
                        </div>
                      ) : (
                        <div className="action-toolbar">
                          <div
                            className="action-btn"
                            style={{ padding: 0, opacity: 0.7, border: 0 }}
                          >
                            <Text>Code Editor</Text>
                          </div>
                        </div>
                      )}
                      <div
                        style={{
                          width: 15,
                          height: 8,
                          border: "1px solid #ccc",
                          opacity: 0.3,
                          borderRadius: 3,
                          cursor: "pointer",
                          background:
                            meta.sourceLanguage === "json" ? "white" : undefined
                        }}
                        onClick={() => {
                          if (!editor.rootSelected) {
                            meta.sourceLanguage =
                              meta.sourceLanguage === "json"
                                ? "javascript"
                                : "json";
                          }
                        }}
                      ></div>
                    </div>
                    <MonacoEditor
                      theme="vs-dark"
                      options={{ fontSize: 11 }}
                      editorWillMount={(monaco: any) => {
                        editor.setupMonaco(monaco);
                        monacoRef.current = monaco;
                      }}
                      editorDidMount={(ed: any, monaco: any) => {
                        monacoEdRef.current = ed;
                        ed.onDidBlurEditorText(function(e: any) {
                          monacoEditorChange(ed.getValue());
                        });
                        ed.onMouseLeave(function(e: any) {
                          monacoEditorChange(ed.getValue());
                        });
                        ed.onMouseMove(function(e: any) {
                          monacoEditorChange(ed.getValue());
                        });
                        ed.addAction({
                          id: "cactiva-apply-changes",
                          label: "Apply Changes",
                          keybindings: [
                            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
                          ],
                          run: function(ed: any) {
                            if (editor.selectedSource.length > 0) {
                              editor.applySelectedSource();
                            }
                            return null;
                          }
                        });
                        ed.addAction({
                          id: "cactiva-save",
                          label: "Save",
                          keybindings: [
                            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S
                          ],
                          run: function(ed: any) {
                            editor.save();
                            return null;
                          }
                        });
                      }}
                      language={meta.sourceLanguage}
                    />
                  </div>
                )
              )}
            </div>
          </Split>
        </div>
      </div>
      <div className="cactiva-editor-footer">
        <CactivaBreadcrumb editor={editor} />
        <div
          className={`toggle-jsx ${meta.jsx ? "active" : ""}`}
          onClick={() => {
            meta.jsx = !meta.jsx;

            if (meta.jsx === false) {
              editor.rootSelected = false;
              editor.selectedSource = "";
            }
            localStorage.setItem(
              "cactiva-editor-source-visible",
              meta.jsx ? "y" : "n"
            );
          }}
        >
          <Icon icon={meta.jsx ? "eye-off" : "eye-open"} size={12} />
          <div style={{ marginLeft: 5 }}>Code</div>
        </div>
      </div>
    </div>
  );
});
