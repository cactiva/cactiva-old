import "@src/App.scss";
import CactivaEditor from "@src/components/editor/CactivaEditor";
import { Pane, Spinner, Text } from "evergreen-ui";
import hotkeys from "hotkeys-js";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { DndProvider } from "react-dnd-cjs";
import HTML5Backend from "react-dnd-html5-backend-cjs";
import Split from "react-split";
import { useAsyncEffect } from "use-async-effect";
import CactivaTree, { tree } from "./components/ctree/CactivaTree";
import {
  commitChanges,
  prepareChanges,
  removeElementById
} from "./components/editor/utility/elements/tools";
import CactivaHead from "./components/head/CactivaHead";
import CactivaTraits from "./components/traits/CactivaTraits";
import api from "./libs/api";
import editor from "./store/editor";
import Welcome from "./Welcome";

const generateFonts = (fonts: any) => {
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
hotkeys(
  "ctrl+shift+z,command+shift+z, ctrl+y,command+y",
  (event, handler) => {
    if (editor.current) editor.current.history.redo();
    event.preventDefault();
  }
);
hotkeys("backspace, delete", (event, handler) => {
  const current = editor.current;
  if (current) {
    prepareChanges(current);
    removeElementById(current.source, current.selectedId);
    commitChanges(current);
  }
  event.preventDefault();
});

export default observer(() => {
  const current = editor.current;
  const meta = useObservable({
    currentPane: "props",
    currentProject: "",
    traitPane: false
  });

  useAsyncEffect(async () => {
    const res = await api.get("project/info");
    editor.name = res.app;
    editor.cli.status = res.status;
    return res;
  }, []);

  useAsyncEffect(async () => {
    await editor.load(
      localStorage.getItem("cactiva-current-path") || "/src/Home.tsx"
    );
    if (editor.status === "failed") {
      editor.load("/src/Home.tsx");
    }
  }, []);

  useEffect(() => {
    meta.currentProject = editor.path;
    current &&
      (current.traitPane =
        localStorage.getItem("cactiva-editor-trait-visible") === "y"
          ? true
          : false);
  }, [editor.status]);

  useEffect(() => {
    current && (meta.traitPane = current.traitPane);
  }, [current && current.traitPane]);

  useEffect(() => {
    if (current && current.renderfont) {
      const load = async () => {
        const fontlist = await api.get("assets/font-list");
        generateFonts(fontlist.children);
      };
      load();
      current.renderfont = false;
    }
  }, [editor.status, current && current.renderfont]);

  if (!meta.currentProject) {
    return <Welcome editor={editor} />;
  }
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="cactiva-container">
        <div className="cactiva-head-outer">
          <CactivaHead editor={editor} />
        </div>
        <Split
          sizes={
            meta.traitPane
              ? editor.status === "loading"
                ? [15, 85]
                : [15, 70, 15]
              : [15, 85]
          }
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
          {editor.status === "loading" ||
            Object.keys(tree.list).length === 0 ? (
              <div className="cactiva-editor-loading">
                <Spinner size={18} />
                <Text color="muted" size={300} style={{ marginLeft: 8 }}>
                  Loading
              </Text>
              </div>
            ) : (
              <div
                className="cactiva-pane cactiva-editor-container"
                onContextMenu={(e: any) => {
                  e.preventDefault();
                }}
              >
                {current && current.source && <CactivaEditor editor={current} />}
              </div>
            )}

          {meta.traitPane && editor.status !== "loading" ? (
            <div className="cactiva-pane">
              <div className="cactiva-pane-inner">
                {/* <div className="cactiva-pane-tab-header">
                  <Tab
                    style={{ flex: 1 }}
                    isSelected={meta.currentPane === "props"}
                    onSelect={() => (meta.currentPane = "props")}
                  >
                    Props
                  </Tab>
                  <Tab
                    style={{ flex: 1 }}
                    isSelected={meta.currentPane === "hooks"}
                    onSelect={() => (meta.currentPane = "hooks")}
                  >
                    Hooks
                  </Tab>
                </div> */}
                <>
                  {current && current.source && current.selected ? (
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
                </>
                {/* {meta.currentPane === "hooks" && (
                  <CactivaHooks editor={current} />
                )} */}
              </div>
            </div>
          ) : (
              <div style={{ flex: 1 }}></div>
            )}
        </Split>
      </div>
    </DndProvider>
  );
});
