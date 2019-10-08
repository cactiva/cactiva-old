import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import useAsyncEffect from "use-async-effect";
import api from "@src/libs/api";
import "./CactivaTree.scss";
import { Text, Icon, SearchInput } from "evergreen-ui";
import CactivaDraggable from "../editor/CactivaDraggable";
import { SyntaxKind } from "../editor/utility/syntaxkinds";
import tags from "../editor/utility/tags";
import _ from "lodash";

export default observer(({ editor }: any) => {
  const meta = useObservable({ list: [] });
  useAsyncEffect(async () => {
    const res = await api.get("ctree/list");
    meta.list = res.children;
  }, []);

  return (
    <div className="cactiva-tree">
      <SearchInput
        className="search"
        placeholder="Search"
        width="100%"
        height={25}
        spellCheck={false}
      />
      <div className="list">
        {_.sortBy(meta.list, "type").map((e: any, i: number) => {
          const name =
            e.type === "dir" ? e.name : e.name.substr(0, e.name.length - 4);
          const el = (
            <>
              <div className="icon">
                {e.type === "dir" ? (
                  <Icon icon="folder-close" size={10} color="#66788a" />
                ) : (
                  <Icon icon="code" size={10} color="#66788a" />
                )}
              </div>
              <Text color="#333">{name}</Text>
            </>
          );
          return e.type === "dir" ? (
            <div key={i} className="item">
              {el}
            </div>
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
              <div className="item">{el}</div>
            </CactivaDraggable>
          );
        })}
      </div>
    </div>
  );
});
