import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import CactivaDraggable from "./CactivaDraggable";
import CactivaSelectable from "./CactivaSelectable";
import { findElementById, getIds } from "./utility/elements/tools";
import { kindNames } from "./utility/kinds";
import { Icon } from "evergreen-ui";

export default observer(({ source, editor }: any) => {
  const meta = useObservable({
    nav: [],
    shouldUpdateNav: true
  });
  useEffect(() => {
    if (!meta.shouldUpdateNav) {
      meta.shouldUpdateNav = true;
      return;
    }
    meta.nav = generatePath(editor, source);
  }, [editor.selectedId, editor.undoStack.length]);

  const lastNav: any = meta.nav[meta.nav.length - 1];
  const lastId = _.get(lastNav, "source.id");
  return (
    <div className="cactiva-breadcrumb">
      <div className="breadcrumb-tag">
        <div>
          <span
            style={{
              marginLeft: -6,
              display: "flex",
              flexDirection: "row",
              userSelect: "none",
              alignItems: "center"
            }}
          >
            <div style={{ margin: '1px 6px -1px 0px' }}>
              <Icon icon={"layout-hierarchy"} size={9} color={"#878787"} />
            </div>
            Root
          </span>
        </div>
      </div>
      {_.map(meta.nav, (v: any, i) => {
        const cactiva = editor.cactivaRefs[v.source.id];
        if (!cactiva) return null;

        return (
          <CactivaSelectable
            key={i}
            cactiva={cactiva}
            style={{}}
            className={`breadcrumb-tag ${
              editor.selectedId === v.source.id ? "selected" : ""
            }`}
            showElementTag={false}
            onBeforeSelect={() => {
              meta.shouldUpdateNav = false;
            }}
          >
            <CactivaDraggable cactiva={cactiva}>
              <span>{v.name}</span>
            </CactivaDraggable>
          </CactivaSelectable>
        );
      })}
      {lastId === editor.selectedId && lastId && editor.cactivaRefs[lastId] && (
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
    if (!!el && !!el.name)
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
  return nav.reverse();
};
