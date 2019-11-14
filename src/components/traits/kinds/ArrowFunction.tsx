import { promptCustomComponent } from "@src/components/editor/CactivaCustomComponent";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import {
  Checkbox,
  IconButton,
  Menu,
  Pane,
  Popover,
  Tooltip
} from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { ICactivaTraitFieldProps } from "../CactivaTraitField";
import "./TrueKeyword.scss";

export default observer((trait: ICactivaTraitFieldProps) => {
  const toggleRef = useRef(null as any);
  const meta = useObservable({
    value: trait.value,
    alsoReset: false
  });
  useEffect(() => {
    meta.value = trait.value || trait.default;
  }, [trait.value]);
  return (
    <Popover
      position={"left"}
      minWidth={100}
      content={
        <div className="ctree-menu">
          <Menu>
            <Menu.Item
              icon="link"
              onSelect={async () => {
                const toggle = _.get(toggleRef, "current");
                toggle();
                meta.alsoReset = false;
                const name = await promptCustomComponent({
                  header: observer(() => (
                    <Checkbox
                      marginTop={0}
                      checked={meta.alsoReset}
                      onChange={e => {
                        meta.alsoReset = !meta.alsoReset;
                      }}
                      label="Also reset navigation"
                    />
                  ))
                });
                if (name) {
                  meta.value = {
                    body: [
                      {
                        kind: SyntaxKind.ExpressionStatement,
                        value: `nav.${
                          meta.alsoReset ? "reset" : "navigate"
                        }("${name.substr(5, name.length - 9)}");`
                      }
                    ],
                    modifiers: [SyntaxKind.AsyncKeyword],
                    kind: SyntaxKind.ArrowFunction,
                    params: []
                  };
                  trait.update(meta.value);
                }
              }}
            >
              Navigate to
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              icon="edit"
              onSelect={() => {
                const toggle = _.get(toggleRef, "current");
                toggle();
                if (!meta.value) {
                  meta.value = {
                    body: [
                      {
                        kind: SyntaxKind.ExpressionStatement,
                        value: `// type your function here...`
                      }
                    ],
                    kind: SyntaxKind.ArrowFunction,
                    params: []
                  };
                  trait.update(meta.value);
                }
                trait.editor.jsx = true;
              }}
            >
              Edit Function
            </Menu.Item>
          </Menu>
        </div>
      }
    >
      {({ toggle, getRef, isShown }: any) => {
        toggleRef.current = toggle;
        return (
          <Tooltip
            content={
              <code
                style={{ color: "white", fontSize: 9, whiteSpace: "pre-wrap" }}
              >{`{${generateSource(trait.rawValue)}}`}</code>
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
                position: "relative"
              }}
            >
              <IconButton
                icon="function"
                height={20}
                innerRef={getRef}
                flex={1}
                onClick={() => {
                  toggle();
                }}
              />
            </Pane>
          </Tooltip>
        );
      }}
    </Popover>
  );
});
