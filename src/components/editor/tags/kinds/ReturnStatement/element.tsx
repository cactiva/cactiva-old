import CactivaChildren from "@src/components/editor/CactivaChildren";
import { observer } from "mobx-react-lite";
import React from "react";

export default observer((props: any) => {
  const cactiva = props._cactiva;
  return (
    <CactivaChildren
      source={{
        kind: cactiva.source.kind,
        id: cactiva.source.id,
        child: {
          id: cactiva.source.id + "_0",
          value: cactiva.source.value
        }
      }}
      cactiva={cactiva}
      parentInfo={(c: any) => ({
        isLastChild: c.isLastChild,
        id: cactiva.source.id
      })}
    />
  );
});
