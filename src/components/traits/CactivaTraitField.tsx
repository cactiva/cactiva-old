import {
  Alert,
  Menu,
  Pane,
  Popover,
  Text,
  Tooltip,
  Icon,
  IconButton
} from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import { ICactivaTraitField } from "../editor/utility/classes";
import { kindNames } from "../editor/utility/kinds";
import { SyntaxKind } from "../editor/utility/syntaxkinds";
import kinds from "./tags";
import { generateSource } from "../editor/utility/parser/generateSource";
import editor from "@src/store/editor";
import { toJS } from "mobx";
import { promptExpression } from "../editor/CactivaExpressionDialog";
import {
  applyImport,
  getSelectableParent
} from "../editor/utility/elements/tools";
import { parseStyle } from "../editor/utility/parser/parser";

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
  let kindName = kindNames[trait.kind];
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
              showDelay={500}
              content={
                <Text
                  color={"white"}
                  fontSize={"10px"}
                  textTransform={"capitalize"}
                >
                  {trait.name}
                </Text>
              }
              position="top"
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
          <Pane style={{ flex: 1 }}>
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
              <Tooltip
                content={
                  <code
                    style={{ color: "white", fontSize: 11 }}
                  >{`{${generateSource(trait.rawValue)}}`}</code>
                }
              >
                <Pane
                  style={{
                    flex: 1,
                    height: "18px",
                    padding: "0px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...fieldStyle,
                    position: "relative"
                  }}
                >
                  <div
                    className={`cactiva-trait-input`}
                    style={{
                      flex: 1,
                      height: "18px",
                      padding: "0px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative"
                    }}
                  >
                    <IconButton
                      icon="function"
                      height={20}
                      flex={1}
                      onClick={async () => {
                        // const exp = await promptExpression({
                        //   returnExp: true,
                        //   local: true,
                        //   async: true,
                        //   value: generateSource(_.get(trait, 'rawValue'))
                        // });
                        // if (exp.expression) {
                        //   applyImport(exp.imports);
                        //   trait.update(exp.expression);
                        // }

                        trait.editor.jsx = true;
                      }}
                    />
                  </div>
                </Pane>
              </Tooltip>
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
