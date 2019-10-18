import { observer } from "mobx-react-lite";
import React from "react";
import { ICactivaTraitFieldProps } from "../CactivaTraitField";
import "./FalseKeyword.scss";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import { Checkbox } from "evergreen-ui";

export default observer((trait: ICactivaTraitFieldProps) => {
  const update = () => {
    trait.update("true", SyntaxKind.TrueKeyword);
  };
  return <Checkbox label={null} checked={false} margin={0} onChange={update} />;
});
