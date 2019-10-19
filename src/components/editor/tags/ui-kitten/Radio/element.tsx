import {
  commitChanges,
  prepareChanges
} from "@src/components/editor/utility/elements/tools";
import {
  parseProps,
  parseValue
} from "@src/components/editor/utility/parser/parser";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import CactivaDraggable from "../../../CactivaDraggable";
import CactivaDropChild from "../../../CactivaDroppable";
import CactivaSelectable from "../../../CactivaSelectable";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const style = parseValue(props.style);
  const tagProps = parseProps(props);
  const meta = useObservable({ dropOver: false });
  const body: any = _.get(cactiva.source, "props.text", {});
  const onDoubleClick = (e: any) => {
    e.preventDefault();
    let text = prompt(
      `Use double quotes ("text") to return string:`,
      _.get(body, "value")
    );
    if (text !== null) {
      const StringLiteral =
        text.charAt(0) === '"' && text.charAt(text.length - 1) === '"';
      prepareChanges(cactiva.editor);
      if (StringLiteral) {
        let newbody = {
          kind: SyntaxKind.StringLiteral,
          value: text
        };
        cactiva.source.props.text = newbody;
      } else {
        let newbody = {
          kind: text.includes(".")
            ? SyntaxKind.PropertyAccessExpression
            : SyntaxKind.Identifier,
          value: text
        };
        cactiva.source.props.text = newbody;
      }
      commitChanges(cactiva.editor);
    }
  };
  const onBeforeDropOver = (item: any, type: string) => {
    if (type === "after" && item.name === "Radio") {
      return true;
    }
  };
  return (
    <CactivaDropChild
      cactiva={cactiva}
      onDropOver={(value: boolean) => (meta.dropOver = value)}
      canDropOver={false}
      onBeforeDropOver={onBeforeDropOver}
    >
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable
          cactiva={cactiva}
          onDoubleClick={onDoubleClick}
          style={style}
          className="cactiva-element uik-radio"
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
            ></div>
          </div>
          <div className="label">{tagProps.text}</div>
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
