import api from "@src/libs/api";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useCallback, useEffect } from "react";
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
import { generateSource } from "./utility/parser/generateSource";
import { renderChildren } from "./utility/renderchild";
import { SyntaxKind } from "./utility/syntaxkinds";

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
    jsx: false,
    source: ""
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
  rootProps.onDoubleClick = rootProps.onClick;
  delete rootProps.onClick;

  useEffect(() => {
    meta.source = _.get(editor, "selected.source")
      ? generateSource(editor.selected.source)
      : "";
  }, [editor.selectedId]);
  return (
    <div className="cactiva-editor" {...rootProps}>
      {meta.onDrag && <input {...getInputProps()} />}

      <div className="cactiva-wrapper">
        <CactivaToolbar />
        <div className="cactiva-editor-wrapper">
          <Split
            sizes={[50, 50]}
            gutterSize={5}
            gutterAlign="center"
            dragInterval={1}
            direction="vertical"
            className={`cactiva-editor-content ${
              meta.jsx ? "split" : "unsplit"
            }`}
          >
            <div className="cactiva-canvas">{children}</div>
            <div
              className={`cactiva-editor-source `}
              style={{ display: meta.jsx ? "flex" : "none" }}
            >
              {meta.jsx && (
                <MonacoEditor
                  theme="vs-dark"
                  value={meta.source}
                  onChange={value => {
                    console.log(value);
                    meta.source = value;
                  }}
                  editorWillMount={monaco => {
                    editor.setupMonaco(monaco);
                  }}
                  language="typescript"
                />
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
          }}
        >
          JSX
        </div>
      </div>
    </div>
  );
});
