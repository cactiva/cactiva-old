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

export default observer(({ source, editor }: any) => {
  const meta = useObservable({
    onDrag: false,
    jsx:
      localStorage.getItem("cactiva-editor-source-visible") === "y"
        ? true
        : false,
    sourceLanguage: "javascript",
    source: "",
    edHeight: parseInt(
      localStorage.getItem("cactiva-editor-source-height") || "40"
    )
  });
  const children = renderChildren(
    { name: "--root--", children: [source] },
    editor
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
    if (source.children.length > 0) {
      const idx = source.children.length - 1;
      insertAfterElementId(source, source.children[idx].id, el);
    } else {
      addChildInId(source, source.id, el);
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
  const isSelected = !!editor.rootSelected || !!editor.selectedId;
  rootProps.onDoubleClick = rootProps.onClick;
  delete rootProps.onClick;

  useEffect(() => {
    try {
      if (editor.rootSelected) {
        meta.source = prettier.format(
          editor.rootSource.replace(
            "<<<<cactiva>>>>",
            generateSource(editor.source)
          ),
          {
            parser: "typescript",
            plugins: [typescript]
          }
        );
        meta.sourceLanguage = "javascript";
      } else {
        if (meta.sourceLanguage === "json") {
          meta.source = JSON.stringify(editor.selected.source, null, 2);
        } else {
          meta.source = _.get(editor, "selected.source")
            ? prettier.format(generateSource(editor.selected.source), {
                parser: "typescript",
                plugins: [typescript]
              })
            : "";
        }
      }
    } catch (e) {
      console.log(e);
    }
    if (monacoRef.current) {
      monacoRef.current.setValue(meta.source);
      monacoRef.current.layout();
    }
  }, [editor.selectedId, editor.rootSelected, meta.sourceLanguage]);

  return (
    <div className="cactiva-editor" {...rootProps}>
      {meta.onDrag && <input {...getInputProps()} />}

      <div className="cactiva-wrapper">
        <CactivaToolbar />
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
              if (monacoRef.current) {
                monacoRef.current.layout();
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
                    {!editor.rootSelected && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          padding: "0px 3px 5px 5px",
                          height: 6,
                          justifyContent: "space-between"
                        }}
                      >
                        <div></div>
                        <div
                          style={{
                            width: 15,
                            height: 4,
                            border: "1px solid #ccc",
                            opacity: 0.3,
                            borderRadius: 33,
                            cursor: "pointer",
                            background:
                              meta.sourceLanguage === "json"
                                ? "white"
                                : undefined
                          }}
                          onClick={() => {
                            meta.sourceLanguage =
                              meta.sourceLanguage === "json"
                                ? "javascript"
                                : "json";
                          }}
                        ></div>
                      </div>
                    )}
                    <MonacoEditor
                      theme="vs-dark"
                      onChange={value => {
                        meta.source = value;
                      }}
                      options={{ fontSize: 11 }}
                      editorWillMount={(monaco: any) => {
                        editor.setupMonaco(monaco);
                      }}
                      editorDidMount={(monaco: any) => {
                        monacoRef.current = monaco;
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
        <CactivaBreadcrumb source={source} editor={editor} />
        <div
          className={`toggle-jsx ${meta.jsx ? "active" : ""}`}
          onClick={() => {
            meta.jsx = !meta.jsx;
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
