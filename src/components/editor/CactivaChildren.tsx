import { observer } from "mobx-react-lite";
import { renderChildren } from "./utility/renderchild";
import React from "react";

export default ({ source = null, cactiva, parentInfo }: any) => {
  const rendered = renderChildren(
    source || cactiva.source,
    cactiva.editor,
    cactiva.root,
    parentInfo
  );

  if (!rendered) return null;
  else {
    if (!rendered.kind) {
      return rendered;
    } else {
      return <div>Failed to render</div>;
    }
  }
};
