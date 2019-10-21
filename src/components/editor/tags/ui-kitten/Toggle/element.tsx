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
  const onDoubleClick = (e: any) => {
    e.preventDefault();
    const StringLiteral = _.get(body, "kind") === SyntaxKind.StringLiteral;
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
