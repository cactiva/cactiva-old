import { Icon } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import CactivaDraggable from "./CactivaDraggable";
import CactivaSelectable from "./CactivaSelectable";
import { findElementById, getIds, uuid } from "./utility/elements/tools";
import { kindNames } from "./utility/kinds";

export default observer(({ editor }: any) => {
  const meta = useObservable({
    nav: [],
    shouldUpdateNav: true
  });
  const lastNav: any = meta.nav[meta.nav.length - 1];
  const lastId = _.get(lastNav, "source.id");
  const cactivaRef = editor.cactivaRefs.length > 0 && editor.cactivaRefs[lastId];
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

  useEffect(() => {
    if (!meta.shouldUpdateNav) {
      meta.shouldUpdateNav = true;
      return;
    }
    meta.nav = generatePath(editor, editor.source);
  }, [editor.selectedId, editor.undoStack.length]);

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
      {_.map(meta.nav, (v: any) => {
        return (
          <ElementTag
            key={uuid("breadcrumb")}
            value={v}
            editor={editor}
            meta={meta}
          />
        );
      })}
      {!editor.rootSelected &&
        lastId === editor.selectedId &&
        lastId &&
        cactivaRef && (
          <div className={`breadcrumb-tag last selected`}>
            <CactivaDraggable cactiva={cactivaRef}>
              <CactivaSelectable
                cactiva={cactivaRef}
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

const ElementTag = observer((props: any) => {
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
});

const generatePath = (editor: any, source: any) => {
  const nav: any = [];
  const selectedId = getIds(editor.selectedId);
  const currentId = _.clone(selectedId);
  selectedId.map(_ => {
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
  });
  return nav.reverse();
};
