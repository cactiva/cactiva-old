import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import useAsyncEffect from "use-async-effect";
import api from "@src/libs/api";
import "./CactivaTree.scss";
import { Text, Icon, SearchInput } from "evergreen-ui";
import CactivaDraggable from "../editor/CactivaDraggable";
import { SyntaxKind } from "../editor/utility/syntaxkinds";
import tags from "../editor/utility/tags";
import _, { map } from "lodash";
import { generateSource } from "../editor/utility/parser/generateSource";
import MonacoEditor from "react-monaco-editor";

export default observer(({ editor }: any) => {
  const meta = useObservable({ list: [] });
  const selected = editor.path;
  useAsyncEffect(async () => {
    const res = await api.get("ctree/list");
    meta.list = res.children;
    expandSelected(selected, meta.list, null);
  }, []);

  return (
    <div
      className="cactiva-tree"
      onContextMenu={e => {
        e.preventDefault();
      }}
    >
      <div className="search-box">
        <SearchInput
          className="search"
          placeholder="Search"
          width="100%"
          height={25}
          spellCheck={false}
        />
        <div className={`search-opt`} onClick={() => {}}>
          <Icon icon={"plus"} size={11} color={"#aaa"} />
        </div>
      </div>
      <div className="list">
        <div className="list-body">
          {renderTree(editor, meta.list, selected, 0)}
          <div style={{ height: 100 }} />
        </div>
      </div>
    </div>
  );
});

const expandSelected = (path: string, list: any, parent: any) => {
  _.map(list, (e: any) => {
    e.relativePath = e.relativePath.replace("./", "/src/");
    e.parent = parent;
    if (path === e.relativePath) {
      let epar = e.parent;
      while (epar) {
        epar.expanded = true;
        epar = epar.parent;
      }
    }

    if (e.type === "dir") {
      expandSelected(path, e.children, e);
    }
  });
};

const renderTree = (
  editor: any,
  tree: any,
  selected: string,
  level: number
) => {
  return _.sortBy(tree, "type").map((e: any, i: number) => {
    const name =
      e.type === "dir" ? e.name : e.name.substr(0, e.name.length - 4);
    const el = (
      <>
        <div className="icon">
          {e.type === "dir" ? (
            <Icon
              icon={e.expanded ? "folder-open" : "folder-close"}
              size={10}
              color="#66788a"
            />
          ) : (
            <Icon icon="code" size={10} color="#66788a" />
          )}
        </div>
        <Text color="#333">{name}</Text>
      </>
    );
    return e.type === "dir" ? (
      <React.Fragment key={i}>
        <div
          className="item"
          style={{ paddingLeft: level * 10 }}
          onClick={() => {
            e.expanded = !e.expanded;
          }}
        >
          {el}
        </div>
        {e.expanded && (
          <div className={`list`}>
            {renderTree(editor, e.children, selected, level + 1)}
          </div>
        )}
      </React.Fragment>
    ) : (
      <CactivaDraggable
        key={i}
        cactiva={{
          source: { id: null },
          tag: {
            tagName: name,
            mode: "component"
          }
        }}
      >
        <div
          onClick={() => {
            localStorage.setItem("cactiva-current-path", e.relativePath);
            editor.load(e.relativePath);
          }}
          style={{ paddingLeft: level * 10 }}
          className={`item ${selected === e.relativePath ? "selected" : ""}`}
        >
          {el}
        </div>
      </CactivaDraggable>
    );
  });
};
