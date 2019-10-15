import React from "react";
import { observer } from "mobx-react-lite";
import { renderChildren } from "./utility/renderchild";

export default observer(({ source, cactiva, parentInfo }: any) => {
  return renderChildren(source, cactiva.editor, cactiva.root, parentInfo);
});
