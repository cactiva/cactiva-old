import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import { IconButton, Pane, Tooltip } from "evergreen-ui";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { ICactivaTraitFieldProps } from "../CactivaTraitField";
import "./TrueKeyword.scss";

export default observer((trait: ICactivaTraitFieldProps) => {
  const meta = useObservable({
    value: trait.value
  });
  const onDefaultClick = () => {
    if (!meta.value) {
      meta.value = {
        body: [
          {
            kind: SyntaxKind.ExpressionStatement,
            value: `console.log("${trait.path}");`
          }
        ],
        kind: SyntaxKind.ArrowFunction,
        params: []
      };
      trait.update(meta.value);
    }
    trait.editor.jsx = true;
  };
  useEffect(() => {
    meta.value = trait.value || trait.default;
  }, [trait.value]);
  return (
    <Tooltip
      content={
        <code style={{ color: "white", fontSize: 11 }}>{`{${generateSource(
          trait.rawValue
        )}}`}</code>
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
          position: "relative"
        }}
      >
        <IconButton
          icon="function"
          height={20}
          flex={1}
          onClick={onDefaultClick}
        />
      </Pane>
    </Tooltip>
  );
});
