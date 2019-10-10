import {
  commitChanges,
  prepareChanges
} from "@src/components/editor/utility/elements/tools";
import { generateExpression } from "@src/components/editor/utility/parser/generateExpression";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import { renderChildren } from "@src/components/editor/utility/renderchild";
import api from "@src/libs/api";
import { Popover, Text } from "evergreen-ui";
import { toJS } from "mobx";
import { observer, useObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import MonacoEditor from "react-monaco-editor";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDroppable from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const meta = useObservable({
    loading: false,
    source: ""
  });
  const ref = useRef(null);
  const expressions = generateExpression(cactiva.source.value);

  return (
    <CactivaDroppable cactiva={cactiva} canDropOver={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva}>
          <Text
            style={{
              padding: 5,
              margin: 5,
              borderRadius: 5,
              border: "1px solid #ccc",
              fontSize: 10,
              color: "#000",
              backgroundColor: "rgba(255,255,255,1)"
            }}
          >
            {expressions.map((exp: any, key: number) => {
              if (typeof exp === "string") {
                return exp;
              }
              return (
                <div key={key} style={{ paddingLeft: 10 }}>
                  {renderChildren(
                    {
                      kind: cactiva.source.kind,
                      id: cactiva.source.id,
                      child: {
                        id: cactiva.source.id + "_" + key,
                        value: exp
                      }
                    },
                    cactiva.editor,
                    cactiva.root,
                    () => ({
                      canDropAfter: false,
                      onDropped: (item: any, type: string) => {
                        console.log(toJS(exp));
                      }
                    })
                  )}
                </div>
              );
            })}
          </Text>
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDroppable>
  );
});
