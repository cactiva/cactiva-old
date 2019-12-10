import { observer } from "mobx-react-lite";
import { renderChildren } from "./utility/renderchild";
import React from "react";

export default observer(({ source = null, cactiva, parentInfo }: any) => {
  const rendered = renderChildren(
    source || cactiva.source,
    cactiva.editor,
    cactiva.root,
    parentInfo
  );

  if (!rendered) return null;

  if (!rendered.kind) {
    return rendered;
  } else {
    console.log(rendered);
    return <div>Failed to render</div>;
  }

});
