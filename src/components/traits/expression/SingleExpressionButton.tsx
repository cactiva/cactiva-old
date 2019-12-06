import { applyImportAndHook } from "@src/components/editor/utility/elements/tools";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import { promptExpression } from "@src/components/traits/expression/ExpressionSinglePopup";
import api from "@src/libs/api";
import editor from "@src/store/editor";
import { IconButton, Menu, Pane, Popover, Tooltip } from "evergreen-ui";
import { observer } from "mobx-react-lite";
import React, { useRef } from "react";

export default ({ source, style, update }: any) => {
  const toggleRef = useRef(null as any);
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
            marginLeft: "-1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"
          }}
        >
          <Popover
            position={"left"}
            minWidth={100}
            content={
              <ButtonMenu
                toggleRef={toggleRef}
                source={source}
                update={update}
              />
            }
          >
            {({ toggle, getRef, isShown }: any) => {
              toggleRef.current = toggle;
              return (
                <IconButton
                  icon="function"
                  innerRef={getRef}
                  height={20}
                  flex={1}
                  appearance={source ? "primary" : undefined}
                  intent={source ? "success" : undefined}
                  onClick={async () => {
                    const src = await promptExpression({
                      value: generateSource(source),
                      local: true
                    });
                    if (src) {
                      const res = await api.post("morph/parse-exp", {
                        value: src.expression
                      });
                      update(res, false);
                    }
                  }}
                />
              );
            }}
          </Popover>
        </div>
      </Pane>
    </Tooltip>
  );
};

const ButtonMenu = observer(({ toggleRef, source, update }: any) => {
  const toggle = toggleRef.current;
  return (
    <div className="ctree-menu">
      <Menu>
        <Menu.Item
          icon="new-text-box"
          onSelect={async () => {
            toggle();
            const src = await promptExpression({
              value: generateSource(source),
              local: true
            });
            if (src) {
              const res = await api.post("morph/parse-exp", {
                value: src.expression
              });
              update(res, false);
              applyImportAndHook(src.imports);
            }
          }}
        >
          Edit Value
        </Menu.Item>
        <Menu.Item
          icon="edit"
          onSelect={() => {
            toggle();
            if (editor && editor.current) editor.current.jsx = true;
          }}
        >
          Edit Component
        </Menu.Item>
      </Menu>
    </div>
  );
});
