import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import CactivaDraggable from "./CactivaDraggable";
import CactivaSelectable from "./CactivaSelectable";
import { findElementById, getIds } from "./utility/elements/tools";
import { kindNames } from "./utility/kinds";
import { Icon } from "evergreen-ui";

export default observer(({ editor }: any) => {
  const meta = useObservable({
    nav: [],
    shouldUpdateNav: true
  });
  useEffect(() => {
    if (!meta.shouldUpdateNav) {
      meta.shouldUpdateNav = true;
      return;
    }
    meta.nav = generatePath(editor, editor.source);
  }, [editor.selectedId, editor.undoStack.length]);

  const lastNav: any = meta.nav[meta.nav.length - 1];
  const lastId = _.get(lastNav, "source.id");
  return (
    <div className="cactiva-breadcrumb">
      <div
        className={`breadcrumb-tag ${editor.rootSelected ? "selected" : ""}`}
        onClick={() => {
          if (!editor.rootSelected) {
            if (!editor.applySelectedSource()) {
              return;
            }
          }

          editor.rootSelected = !editor.rootSelected;
          if (!editor.rootSelected) {
            editor.jsx = false;
          }
        }}
      >
        <div>
          <span
            style={{
              marginLeft: -6,
              display: "flex",
              flexDirection: "row",
              maxWidth: "none",
              userSelect: "none",
              alignItems: "center"
            }}
          >
            <div style={{ margin: "1px 6px -1px 0px" }}>
              <Icon
                icon={"layout-hierarchy"}
                size={9}
                color={editor.rootSelected ? "#1070ca" : "#878787"}
              />
            </div>
            SourceFile
          </span>
        </div>
      </div>
      {_.map(meta.nav, (v: any, i) => {
        const cactiva = editor.cactivaRefs[v.source.id];
        if (!cactiva) return null;
        const isSelected = !!(
          editor.rootSelected === false && editor.selectedId === v.source.id
        );
        return (
          <CactivaSelectable
            key={i}
            cactiva={cactiva}
            className={`breadcrumb-tag ${isSelected ? "selected" : ""}`}
            ignoreClassName={["selected"]}
            showElementTag={false}
            onBeforeSelect={() => {
              meta.shouldUpdateNav = false;
              if (editor.selectedId === v.source.id) {
                editor.jsx = !editor.jsx;
              } else if (!editor.jsx) {
                editor.jsx = true;
              }
            }}
          >
            <CactivaDraggable cactiva={cactiva}>
              <span>{v.name}</span>
            </CactivaDraggable>
          </CactivaSelectable>
        );
      })}
      {!editor.rootSelected &&
        lastId === editor.selectedId &&
        lastId &&
        editor.cactivaRefs[lastId] && (
          <div className={`breadcrumb-tag last selected`}>
            <CactivaDraggable cactiva={editor.cactivaRefs[lastId]}>
              <CactivaSelectable
                cactiva={editor.cactivaRefs[lastId]}
                style={{}}
                className=""
                showElementTag={false}
                onBeforeSelect={() => {
                  meta.shouldUpdateNav = false;
                }}
              ></CactivaSelectable>
            </CactivaDraggable>
          </div>
        )}
    </div>
  );
});

const generatePath = (editor: any, source: any) => {
  const nav: any = [];
  const selectedId = getIds(editor.selectedId);
  const currentId = [...selectedId];
  for (let id in selectedId) {
    const el = findElementById(source, currentId);
    if (!!el) {
      if (!!el.name)
        nav.push({
          name: el.name,
          source: el
        });
      else
        nav.push({
          name: kindNames[el.kind],
          source: el
        });
      currentId.pop();
    }
  }
  return nav.reverse();
};
