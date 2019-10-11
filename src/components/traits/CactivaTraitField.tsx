import { Alert, Menu, Pane, Popover, Text, Tooltip } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import { ICactivaTraitField } from "../editor/utility/classes";
import { kindNames } from "../editor/utility/kinds";
import { SyntaxKind } from "../editor/utility/syntaxkinds";
import kinds from "./tags";

export interface ICactivaTraitFieldProps extends ICactivaTraitField {
  editor: any;
  source: any;
  value?: any;
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

  if (!KindField) {
    return (
      <Alert
        padding={10}
        ref={fieldRef}
        intent="warning"
        title={`Trait field error: ${kindName} not found!`}
      />
    );
  }
  return (
    <>
      {!!trait.divider && (
        <div className="cactiva-trait-field-divider">
          <span>{trait.divider}</span>
          <div className="line" />
        </div>
      )}
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
          isShown={!fieldName ? false : undefined}
        >
          <Pane style={{ flex: 1 }}>
            <KindField
              {...trait}
              options={trait.options}
              style={{
                flex: 1,
                height: "20px",
                alignItems: "stretch",
                ...fieldStyle,
                position: "relative"
              }}
            />
          </Pane>
        </Tooltip>
      </div>
    </>
  );
});
