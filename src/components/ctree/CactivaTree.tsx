import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import useAsyncEffect from "use-async-effect";
import api from "@src/libs/api";
import "./CactivaTree.scss";
import { Text, Icon } from "evergreen-ui";
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
      {_.sortBy(meta.list, "type").map((e: any, i: number) => {
        const el = (
          <>
            <div className="icon">
              {e.type === "dir" ? (
                <Icon icon="folder-close" size={10} color="#66788A" />
              ) : (
                <Icon icon="code" size={10} color="#66788A" />
              )}
            </div>
            <Text>{e.name}</Text>
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
                tagName: e.name,
                mode: "component"
              }
            }}
          >
            <div className="item">{el}</div>
          </CactivaDraggable>
        );
      })}
    </div>
  );
});
