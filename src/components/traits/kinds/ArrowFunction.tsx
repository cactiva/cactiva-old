import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { ICactivaTraitFieldProps } from "../CactivaTraitField";
import "./TrueKeyword.scss";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import { Checkbox, Tooltip, Pane, IconButton } from "evergreen-ui";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import { toJS } from "mobx";
import traitStyle from "../templates/traitStyle";
import { metaProperty } from "@babel/types";
import editor from "@src/store/editor";
import {
  commitChanges,
  prepareChanges
} from "@src/components/editor/utility/elements/tools";
import _ from "lodash";

export default observer((trait: ICactivaTraitFieldProps) => {
  const meta = useObservable({
    value: trait.value
  });
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
          onClick={() => {
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
          }}
        />
      </Pane>
    </Tooltip>
  );
});
