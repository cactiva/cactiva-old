import editor from "@src/store/editor";
import { Pane, Text, Tooltip } from "evergreen-ui";
import _ from "lodash";
import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { ICactivaTraitField } from "../editor/utility/classes";
import { getSelectableParent } from "../editor/utility/elements/tools";
import { kindNames } from "../editor/utility/kinds";
import { parseStyle } from "../editor/utility/parser/parser";
import { SyntaxKind } from "../editor/utility/syntaxkinds";
import SingleExpressionButton from "./expression/SingleExpressionButton";
import kinds from "./tags";

export interface ICactivaTraitFieldProps extends ICactivaTraitField {
  editor: any;
  source: any;
  value?: any;
  rawValue?: any;
  resetValue: any;
  style?: any;
  mode?: string | "select" & undefined;
  defaultKind: number;
  update: (value: any, updatedKind?: SyntaxKind) => void;
}
export default observer((trait: ICactivaTraitFieldProps) => {

  let kindName = kindNames[trait.defaultKind];
  const KindField = kinds[kindName];

  const fieldRef = useRef(null);
  const fieldStyle = _.get(trait, `options.styles.field`, {});
  const labelStyle = _.get(trait, `options.styles.label`, {});
  const rootStyle = _.get(trait, `options.styles.root`, {});
  const fieldName = _.get(trait, `options.fields.name`, null);

  return (
    <>
      <div className="cactiva-trait-field" style={rootStyle}>
        {trait.label !== false && (
          <div className="label" style={labelStyle}>
            <Tooltip
              position="left"
              content={
                <Text
                  color={"white"}
                  fontSize={"10px"}
                  textTransform={"capitalize"}
                >
                  {trait.name}
                </Text>
              }
            >
              <Text>{trait.name}</Text>
            </Tooltip>
          </div>
        )}
        <div ref={fieldRef} />
        <Tooltip
          showDelay={300}
          position="top"
          content={
            <Text
              color={"white"}
              fontSize={"10px"}
              margin={0}
              padding={0}
              textTransform={"capitalize"}
            >
              {fieldName}
            </Text>
          }
          isShown={
            !fieldName || _.get(trait, "options.fields.name")
              ? false
              : undefined
          }
        >
          <Pane style={{ flex: 1, display: "flex", flexDirection: "row" }}>
            {KindField ? (
              <KindField
                {...trait}
                options={prepareTraitOptions(trait)}
                style={{
                  flex: 1,
                  height: "20px",
                  alignItems: "stretch",
                  ...fieldStyle,
                  position: "relative"
                }}
              />
            ) : (
                <SingleExpressionButton
                  source={trait.rawValue}
                  style={fieldStyle}
                  update={trait.update}
                />
              )}
          </Pane>
        </Tooltip>
      </div>
    </>
  );
});

const prepareTraitOptions = (trait: any) => {
  if (["style.value.alignSelf"].indexOf(trait.path) >= 0 && editor.current) {
    const parent = getSelectableParent(
      editor.current.source,
      editor.current.selected.source.id
    );
    const parentStyle = parseStyle(_.get(parent, "props.style"));
    const flexDirection = _.get(parentStyle, "flexDirection", "column");

    if (flexDirection === "column") {
      return {
        items: trait.options.items.map((item: any) => {
          if (item.value === "flex-start" || item.value === "flex-end") {
            item.className = "rotate-270";
          }
          return item;
        }),
        ...trait.options,
        className: "rotate-90"
      };
    }

    return trait.options;
  }
  if (
    ["style.value.alignItems", "style.value.justifyContent"].indexOf(
      trait.path
    ) >= 0 &&
    editor.current
  ) {
    const s = editor.current.selected;
    if (s) {
      const props = s.source.props;
      const flexDirection = getPropValue(
        props,
        "style.value.flexDirection.value"
      );
      if (flexDirection === "column") {
        return {
          items: trait.options.items.map((item: any) => {
            if (item.value === "flex-start" || item.value === "flex-end") {
              item.className = "rotate-270";
            }
            return item;
          }),
          ...trait.options,
          className: "rotate-90"
        };
      } else if (flexDirection === "row") {
        return {
          ...trait.options,
          className: "rotate-0"
        };
      } else if (flexDirection === "rowreverse") {
        return {
          ...trait.options,
          className: "rotate-0 flip-h"
        };
      } else if (flexDirection === "columnreverse") {
        return {
          ...trait.options,
          className: "rotate-90 flip-v"
        };
      }
    }
  }

  return trait.options;
};

const getPropValue = (props: any, path: string) => {
  const value = _.get(props, path, "");
  if (typeof value === "string") {
    return value.replace(/\W/gi, "");
  }
  return value;
};
