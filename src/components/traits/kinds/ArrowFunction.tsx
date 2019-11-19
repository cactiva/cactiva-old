import { IconButton, Pane } from "evergreen-ui";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { ICactivaTraitFieldProps } from "../CactivaTraitField";
import ExpressionListPopup from "../expression/ExpressionListPopup";
import "./TrueKeyword.scss";

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
