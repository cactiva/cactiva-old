import React from "react";
import { observer } from "mobx-react-lite";
import { renderChildren } from "./utility/renderchild";

export default observer(({ source = null, cactiva, parentInfo }: any) => {
  return renderChildren(
    source || cactiva.source,
    cactiva.editor,
    cactiva.root,
    parentInfo
  );
});
