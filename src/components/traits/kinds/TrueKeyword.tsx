import { observer } from "mobx-react-lite";
import React from "react";
import { ICactivaTraitFieldProps } from "../CactivaTraitField";
import "./TrueKeyword.scss";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import { Checkbox } from "evergreen-ui";

export default observer((trait: ICactivaTraitFieldProps) => {
  const update = () => {
    trait.update("false", SyntaxKind.FalseKeyword);
  };
  return <Checkbox label={null} checked={true} margin={0} onChange={update} />;
});
