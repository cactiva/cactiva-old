import { observer } from "mobx-react-lite";
import { renderChildren } from "./utility/renderchild";
import React from "react";
import { toJS } from "mobx";

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
      if (Array.isArray(rendered)) {
        return rendered.map(r => {
          if (React.isValidElement(r)) {
            return r;
          } else {
            if (typeof r !== 'object') return r;
            else {
              if (Array.isArray(r)) {
                return r[0];
              }
              console.error('Failed to render element to canvas:', r);
              return null;
            }
          }
        }) as any;
      }
      console.log(rendered);
      return null;
    } else {
      return <div>Failed to render</div>;
    }
  }
};
