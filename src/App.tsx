import "@src/App.scss";
import CactivaEditor from "@src/components/editor/CactivaEditor";
import { Pane, Text, Spinner } from "evergreen-ui";
import KeyboardEventHandler from "react-keyboard-event-handler";
import { toJS, observable } from "mobx";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { DndProvider } from "react-dnd-cjs";
import HTML5Backend from "react-dnd-html5-backend-cjs";
import Split from "react-split";
import useAsyncEffect from "use-async-effect";
import CactivaTree, {
  reloadTreeList,
  tree,
  treeListMeta
} from "./components/ctree/CactivaTree";
import {
  commitChanges,
  prepareChanges,
  removeElementById
} from "./components/editor/utility/elements/tools";
import CactivaHead from "./components/head/CactivaHead";
import CactivaTraits from "./components/traits/CactivaTraits";
import api from "./libs/api";
import editor from "./store/editor";
import Start from "./components/projects/Start";

export const fontFamily =
  '"SF UI Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

const generateFonts = () => {
  api.get("assets/font-list").then(res => {
    const fonts = res.children;
    const css: any = document.createElement("style");
    let style = "";
    fonts.map((f: any) => {
      style += `
      @font-face {
        font-family: ${f.name.substr(0, f.name.length - 4)};
        font-style: normal;
        font-weight: 400;
        src: url(${api.url}assets/font/${f.name}) format("truetype");
      }`;
    });
    const node = document.createTextNode(style);
    const root: any = document.getElementById("root");
    css.appendChild(node);
    if (root.children.length > 0 && root.firstChild.tagName === "STYLE") {
      root.removeChild(root.firstChild);
    }
    root.insertBefore(css, root.firstChild);
  });
};

const meta = observable({
  init: false,
  currentPane: "props",
  sizeScreen: [15, 85]
});
export const loadProject = async () => {
  const res = await api.get("project/info");
  editor.name = res.app;
  if (!editor.name) {
    meta.init = true;
    return;
  }
  editor.settings = res.settings;
  editor.expo.status = res.expo;
  editor.expo.url = "";
  editor.backend.status = res.backend;
  editor.theme = res.theme;

  await editor.load(
    localStorage.getItem("cactiva-current-path") || "/src/Home.tsx"
  );
  if (editor.status === "failed") {
    if (treeListMeta.list.length === 0) {
      await reloadTreeList();
    }
    let file = "";
    treeListMeta.list.map(e => {
      if (e.type === "file" && !file)
        file = e.relativePath.replace("./", "/src/");
    });
    await editor.load(file);
  }
  meta.init = true;
};
export default observer(() => {
  const { current } = editor;
  const renderFont = current ? current.renderfont : false;
  const traitPane = current ? current.traitPane : false;

  useAsyncEffect(loadProject, []);

  useEffect(() => {
    if (status === "failed") {
      editor.load("/src/Home.tsx");
    }
  }, [status]);

  useEffect(() => {
    if (renderFont) {
      generateFonts();
      current && (current.renderfont = false);
    }
  }, [renderFont]);

  useEffect(() => {
    meta.sizeScreen = traitPane ? [15, 70, 15] : [15, 85];
  }, [traitPane]);

  if (!meta.init)
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
          display: "flex"
        }}
      >
        <Spinner size={45} />
      </div>
    );
  if (!editor.name || !editor.current) return <Start />;
  return (
    <>
      <KeyboardEventHandler
        handleKeys={[
          "ctrl+x",
          "meta+x",
          "ctrl+c",
          "meta+c",
          "ctrl+v",
          "meta+v",
          "ctrl+s",
          "meta+s",
          "ctrl+z",
          "meta+z",
          "ctrl+shift+z",
          "meta+shift+z",
          "ctrl+y",
          "meta+y",
          "backspace",
          "delete"
        ]}
        onKeyEvent={shortcutKeyHandler}
      ></KeyboardEventHandler>
      <DndProvider backend={HTML5Backend}>
        <div className="cactiva-container">
          <div className="cactiva-head-outer">
            <CactivaHead editor={editor} />
          </div>
          <Split
            sizes={toJS(meta.sizeScreen)}
            minSize={200}
            expandToMin={false}
            gutterSize={5}
            gutterAlign="center"
            snapOffset={0}
            dragInterval={1}
            direction="horizontal"
            className="cactiva-main"
          >
            <div className="cactiva-pane">
              <CactivaTree editor={editor} />
            </div>
            <div
              className="cactiva-pane cactiva-editor-container"
              onContextMenu={(e: any) => {
                e.preventDefault();
              }}
            >
              <CactivaEditorCanvas current={current} />
            </div>
            <CactivaTraitsCanvas current={current} />
          </Split>
        </div>
      </DndProvider>
    </>
  );
});

export const shortcutKeyHandler = (key: string, event: any) => {
  if (editor.isModalOpened) return;
  switch (key) {
    case "ctrl+x":
    case "meta+x":
      editor.cut();
      event.preventDefault();
      break;
    case "ctrl+c":
    case "meta+c":
      editor.copy();
      event.preventDefault();
      break;
    case "ctrl+v":
    case "meta+v":
      editor.paste();
      event.preventDefault();
      break;
    case "ctrl+s":
    case "meta+s":
      if (editor.current) {
        editor.current.save();
      }
      event.preventDefault();
      break;
    case "ctrl+z":
    case "meta+z":
      if (editor.current) editor.current.history.undo();
      event.preventDefault();
      break;
    case "ctrl+shift+z":
    case "meta+shift+z":
    case "ctrl+y":
    case "meta+y":
      if (editor.current) editor.current.history.redo();
      event.preventDefault();
      break;
    case "backspace":
    case "delete":
      const current = editor.current;
      if (current) {
        prepareChanges(current);
        removeElementById(current.source, current.selectedId);
        commitChanges(current);
      }
      event.preventDefault();
      break;
  }
}

const CactivaEditorCanvas = observer((props: any) => {
  const { current } = props;

  if (Object.keys(tree.list).length > 0 && current && current.source) {
    return <CactivaEditor editor={current} />;
  }

  return <div />;
});

const CactivaTraitsCanvas = observer((props: any) => {
  const { current } = props;
  const traitPane = current ? current.traitPane : false;
  const path = current ? current.path : false;
  const activeTraits =
    current && current.source && current.selected && traitPane;

  useEffect(() => {
    current &&
      (current.traitPane =
        localStorage.getItem("cactiva-editor-trait-visible") === "y"
          ? true
          : false);
  }, [path]);
  if (!traitPane) return <div style={{ flex: 1 }} />;

  return (
    <div className="cactiva-pane">
      <div className="cactiva-pane-inner">
        {activeTraits ? (
          <CactivaTraits editor={current} />
        ) : (
            <Pane
              display="flex"
              flexDirection="column"
              padding={10}
              alignItems="center"
              justifyContent="center"
            >
              <img
                src="/images/reindeer.svg"
                style={{ width: "50%", margin: 20, opacity: 0.4 }}
              />
              <Text size={300}>Please select a component</Text>
            </Pane>
          )}
      </div>
    </div>
  );
});
