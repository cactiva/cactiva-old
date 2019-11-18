import { promptCustomComponent } from "@src/components/editor/CactivaCustomComponent";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import {
  Checkbox,
  IconButton,
  Menu,
  Pane,
  Popover,
  Tooltip,
  Button
} from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { ICactivaTraitFieldProps } from "../CactivaTraitField";
import "./TrueKeyword.scss";
import ExpressionListPopup from "../expression/ExpressionListPopup";
import { toJS } from "mobx";

export default observer((trait: ICactivaTraitFieldProps) => {
  const toggleRef = useRef(null as any);
  const meta = useObservable({
    value: trait.value,
    navigateType: "navigate"
  });
  useEffect(() => {
    meta.value = trait.value || trait.default;
  }, [trait.value]);
  return (
    <ExpressionListPopup path="body" source={trait.rawValue} update={trait.update}>
      {(toggle: any, getRef: any) => {
        return (
          <Pane
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
              appearance={trait.rawValue ? "primary" : undefined}
              intent={trait.rawValue ? "success" : undefined}
              flex={1}
              innerRef={getRef}
              onClick={() => {
                toggle();
              }}
            />
          </Pane>
        );
      }}
    </ExpressionListPopup>
  );
});
