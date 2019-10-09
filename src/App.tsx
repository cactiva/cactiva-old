import "@src/App.scss";
import CactivaEditor from "@src/components/editor/CactivaEditor";
import { Pane, Spinner, Tab, Text } from "evergreen-ui";
import hotkeys from "hotkeys-js";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { DndProvider } from "react-dnd-cjs";
import HTML5Backend from "react-dnd-html5-backend-cjs";
import Split from "react-split";
import { useAsyncEffect } from "use-async-effect";
import {
  commitChanges,
  prepareChanges,
  removeElementById
} from "./components/editor/utility/elements/tools";
import CactivaTraits from "./components/traits/CactivaTraits";
import editor from "./store/editor";
import Welcome from "./Welcome";
import CactivaTree from "./components/ctree/CactivaTree";
import CactivaHooks from "./components/hooks/CactivaHooks";

export default observer(() => {
  const current = editor.current;
  const meta = useObservable({
    currentPane: "props",
    value: "yo",
    currentProject: ""
  });

  useAsyncEffect(async () => {
    hotkeys("ctrl+s,command+s", (event, handler) => {
      event.preventDefault();
      if (editor.current) editor.current.history.undo();
    });
    hotkeys("ctrl+z,command+z", (event, handler) => {
      event.preventDefault();
      if (editor.current) editor.current.history.undo();
    });
    hotkeys(
      "ctrl+shift+z,command+shift+z, ctrl+y,command+y",
      (event, handler) => {
        event.preventDefault();
        if (editor.current) editor.current.history.redo();
      }
    );
    hotkeys("backspace, delete", (event, handler) => {
      event.preventDefault();
      const current = editor.current;
      if (current) {
        prepareChanges(current);
        removeElementById(current.source, current.selectedId);
        commitChanges(current);
      }
    });
    editor.load(
      localStorage.getItem("cactiva-current-path") || "/src/Main/Home.tsx"
    );
  }, []);

  useEffect(() => {
    meta.currentProject = editor.path;
  }, [editor.status]);

  if (!meta.currentProject) {
    return <Welcome editor={editor} />;
  }
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="cactiva-container">
        <div className="cactiva-menu"></div>
        <Split
          sizes={editor.status === "loading" ? [15, 85] : [15, 70, 15]}
          minSize={200}
          expandToMin={false}
          gutterSize={5}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          className="cactiva-main"
        >
          <div className="cactiva-pane">
            <CactivaTree editor={editor} />
          </div>
          {editor.status === "loading" ? (
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
              {current && current.source ? (
                <>
                  <CactivaEditor source={current.source} editor={current} />
                </>
              ) : (
                <div>Please Choose A Component</div>
              )}
            </div>
          )}

          {editor.status !== "loading" ? (
            <div
              className="cactiva-pane"
              onContextMenu={e => e.preventDefault()}
            >
              <div className="cactiva-pane-inner">
                <div className="cactiva-pane-tab-header">
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
                </div>
                {meta.currentPane === "props" && (
                  <>
                    {current && current.source && current.selected ? (
                      <CactivaTraits source={current.source} editor={current} />
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
                )}
                {meta.currentPane === "hooks" && (
                  <CactivaHooks editor={current} />
                )}
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
