import React from "react";
import { Tooltip, Pane, IconButton } from "evergreen-ui";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import editor from "@src/store/editor";

export default ({ source, style }: any) => {
  return (
    <Tooltip
      position="left"
      content={
        <code style={{ color: "white", fontSize: 11 }}>{`{${generateSource(
          source
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
          ...style,
          position: "relative"
        }}
      >
        <div
          className={`cactiva-trait-input`}
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
            appearance={source ? "primary" : undefined}
            intent={source ? "success" : undefined}
            onClick={async () => {
              // const exp = await promptExpression({
              //   returnExp: true,
              //   local: true,
              //   async: true,
              //   value: generateSource(_.get(trait, 'rawValue'))
              // });
              // if (exp.expression) {
              //   applyImport(exp.imports);
              //   trait.update(exp.expression);
              // }

              if (editor && editor.current) editor.current.jsx = true;
            }}
          />
        </div>
      </Pane>
    </Tooltip>
  );
};
