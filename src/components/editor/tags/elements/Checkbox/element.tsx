import {
  commitChanges,
  prepareChanges
} from "@src/components/editor/utility/elements/tools";
import {
  parseProps,
  parseValue
} from "@src/components/editor/utility/parser/parser";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import { Icon } from "evergreen-ui";
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
  const onBeforeDropOver = (item: any, type: string) => {
    if (type === "after" && item.name === "Radio") {
      return true;
    }
  };
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
          className="cactiva-element checkbox"
        >
          <div
            className={`tick ${tagProps.checked === "true" ? "active" : ""}`}
          >
            <Icon icon="tick" size={14} color="white" />
          </div>
          <div className="label">{tagProps.text}</div>
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});
