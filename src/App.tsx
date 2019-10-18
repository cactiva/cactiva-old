import "@src/App.scss";
import CactivaEditor from "@src/components/editor/CactivaEditor";
import { Pane, Spinner, Text } from "evergreen-ui";
import hotkeys from "hotkeys-js";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { DndProvider } from "react-dnd-cjs";
import HTML5Backend from "react-dnd-html5-backend-cjs";
import Split from "react-split";
import CactivaTree, { tree } from "./components/ctree/CactivaTree";
import {
  addChildInId,
  commitChanges,
  findParentElementById,
  prepareChanges,
  removeElementById
} from "./components/editor/utility/elements/tools";
import CactivaHead from "./components/head/CactivaHead";
import CactivaTraits from "./components/traits/CactivaTraits";
import api from "./libs/api";
import editor from "./store/editor";

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

hotkeys("ctrl+s,command+s", (event, handler) => {
  if (editor.current) {
    editor.current.save();
  }
  event.preventDefault();
});
hotkeys("ctrl+z,command+z", (event, handler) => {
  if (editor.current) editor.current.history.undo();
  event.preventDefault();
});
hotkeys("ctrl+shift+z,command+shift+z, ctrl+y,command+y", (event, handler) => {
  if (editor.current) editor.current.history.redo();
  event.preventDefault();
});
hotkeys("backspace, delete", (event, handler) => {
  const current = editor.current;
  if (current) {
    prepareChanges(current);
    removeElementById(current.source, current.selectedId);
    commitChanges(current);
  }
  event.preventDefault();
});
hotkeys("ctrl+d,command+d", (event, handler) => {
  const current = editor.current;
  if (current) {
    const duplicateSource = _.cloneDeep(current.selected.source);
    const parent = findParentElementById(current.source, current.selectedId);
    const path = _.get(current, "selected.tag.insertTo", "children");
    prepareChanges(current);
    addChildInId(current.source, parent.id, duplicateSource, path);
    commitChanges(current);
  }
  event.preventDefault();
});

export default observer(() => {
  const { current, status } = editor;
  const meta = useObservable({
    currentPane: "props",
    sizeScreen: [15, 85]
  });
  const renderFont = () => (current ? current.renderfont : false);
  const traitPane = () => (current ? current.traitPane : false);

  useEffect(() => {
    if (renderFont()) {
      generateFonts();
      current && (current.renderfont = false);
    }
  }, [renderFont()]);

  useEffect(() => {
    meta.sizeScreen = traitPane() ? [15, 70, 15] : [15, 85];
  }, [traitPane()]);
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="cactiva-container">
        <div className="cactiva-head-outer">
          <CactivaHead editor={editor} />
        </div>
        <Split
          sizes={meta.sizeScreen}
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
            <CactivaEditorCanvas />
          </div>
          <CactivaTraitsCanvas />
        </Split>
      </div>
    </DndProvider>
  );
});

const CactivaEditorCanvas = observer(() => {
  const { current } = editor;
  let Canvas = observer(() => (
    <div className="cactiva-editor-loading">
      <Spinner size={18} />
      <Text color="muted" size={300} style={{ marginLeft: 8 }}>
        Loading
      </Text>
    </div>
  ));
  if (
    editor.status === "ready" &&
    Object.keys(tree.list).length > 0 &&
    current &&
    current.source
  ) {
    Canvas = observer(() => <CactivaEditor editor={current} />);
  }
  return <Canvas />;
});

const CactivaTraitsCanvas = observer(() => {
  const { current } = editor;

  const traitPane = () => (current ? current.traitPane : false);

  useEffect(() => {
    current &&
      (current.traitPane =
        localStorage.getItem("cactiva-editor-trait-visible") === "y"
          ? true
          : false);
  }, []);

  let Canvas = observer(() => (
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
  ));

  if (current && current.source && current.selected && traitPane()) {
    Canvas = observer(() => <CactivaTraits editor={current} />);
  }

  if (!traitPane()) return <div style={{ flex: 1 }}></div>;

  return (
    <div className="cactiva-pane">
      <div className="cactiva-pane-inner">
        <Canvas />
      </div>
    </div>
  );
});
