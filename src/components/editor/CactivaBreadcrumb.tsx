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
  const onClick = () => {
    if (!editor.rootSelected) {
      if (!editor.applySelectedSource()) {
        return;
      }
    }

    editor.rootSelected = !editor.rootSelected;
    if (!editor.rootSelected) {
      editor.jsx = false;
    }
  };
  let Draggable = () => <div />;
  if (
    !editor.rootSelected &&
    lastId === editor.selectedId &&
    lastId &&
    editor.cactivaRefs[lastId]
  ) {
    Draggable = () => (
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
    );
  }
  return (
    <div className="cactiva-breadcrumb">
      <div
        className={`breadcrumb-tag ${editor.rootSelected ? "selected" : ""}`}
        onClick={onClick}
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
        const key = v.source.id;
        return <ElementTag key={key} value={v} editor={editor} meta={meta} />;
      })}
      <Draggable />
    </div>
  );
});

const ElementTag = (props: any) => {
  const { editor, value, meta } = props;
  const cactiva = editor.cactivaRefs[value.source.id];
  const onBeforeSelect = () => {
    meta.shouldUpdateNav = false;
    if (editor.selectedId === value.source.id) {
      editor.jsx = !editor.jsx;
    } else if (!editor.jsx) {
      editor.jsx = true;
    }
  };
  if (!cactiva) return null;
  const isSelected = !!(
    editor.rootSelected === false && editor.selectedId === value.source.id
  );
  return (
    <CactivaSelectable
      cactiva={cactiva}
      className={`breadcrumb-tag ${isSelected ? "selected" : ""}`}
      ignoreClassName={["selected"]}
      showElementTag={false}
      onBeforeSelect={onBeforeSelect}
    >
      <CactivaDraggable cactiva={cactiva}>
        <span>{value.name}</span>
      </CactivaDraggable>
    </CactivaSelectable>
  );
};

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
