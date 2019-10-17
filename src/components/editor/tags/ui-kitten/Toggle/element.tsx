import CactivaChildren from "@src/components/editor/CactivaChildren";
import CactivaDropMarker from "@src/components/editor/CactivaDropMarker";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";
import { Text, Icon } from "evergreen-ui";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import {
  prepareChanges,
  commitChanges
} from "@src/components/editor/utility/elements/tools";
import {
  parseValue,
  parseProps
} from "@src/components/editor/utility/parser/parser";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseValue(props.style);
  const tagProps = parseProps(props);
  const meta = useObservable({ dropOver: false });
  const body: any = _.get(cactiva.source, "props.text", {});

  return (
    <CactivaDropChild
      cactiva={cactiva}
      onDropOver={(value: boolean) => (meta.dropOver = value)}
      canDropOver={false}
      onBeforeDropOver={(item: any, type: string) => {
        if (type === "after" && item.name === "Radio") {
          return true;
        }
      }}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable
          cactiva={cactiva}
          onDoubleClick={(e: any) => {
            e.preventDefault();
            const StringLiteral =
              _.get(body, "kind") === SyntaxKind.StringLiteral;
            let text = prompt(
              `Use double quotes ("text") to return string:`,
              _.get(body, "value")
            );
            if (text !== null) {
              prepareChanges(cactiva.editor);
              if (StringLiteral) {
                let newbody = {
                  kind: SyntaxKind.StringLiteral,
                  value: text
                };
                cactiva.source.props.text = newbody;
              } else {
                let newbody = {
                  kind: body.kind,
                  value: text
                };
                cactiva.source.props.text = newbody;
              }
              commitChanges(cactiva.editor);
            }
          }}
          style={style}
          className={`cactiva-element uik-toggle ${_.get(
            tagProps,
            "size",
            "medium"
          )} `}
        >
          <div
            className={`bullet ${tagProps.status ? tagProps.status : "basic"} ${
              tagProps.checked === "true" ? "active" : ""
            }`}
          >
            <div
              className={`dot ${tagProps.status ? tagProps.status : "basic"} ${
                tagProps.checked === "true" ? "active" : ""
              }`}
            >
              <Icon icon="tick" size={20} color="white" />
            </div>
          </div>
          <div className="label">{tagProps.text}</div>
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
