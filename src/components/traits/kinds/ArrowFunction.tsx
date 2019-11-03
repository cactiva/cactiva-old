import { promptCustomComponent } from "@src/components/editor/CactivaCustomComponent";
import { promptExpression } from "@src/components/editor/CactivaExpressionDialog";
import { applyImport } from "@src/components/editor/utility/elements/tools";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import { IconButton, Menu, Pane, Popover, Tooltip } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { ICactivaTraitFieldProps } from "../CactivaTraitField";
import "./TrueKeyword.scss";
import { toJS } from "mobx";

export default observer((trait: ICactivaTraitFieldProps) => {
  const toggleRef = useRef(null as any);
  const meta = useObservable({
    value: trait.value
  });
  useEffect(() => {
    meta.value = trait.value || trait.default;
  }, [trait.value]);
  return (
    <Popover position={"left"}
      minWidth={100}
      content={<div className="ctree-menu">
        <Menu>
          <Menu.Item icon="link" onSelect={async () => {
            const toggle = _.get(toggleRef, "current");
            toggle();
            const name = await promptCustomComponent();
            if (name) {
              meta.value = {
                body: [
                  {
                    kind: SyntaxKind.ExpressionStatement,
                    value: `nav.navigate("${name.substr(5, name.length - 9)}");`
                  }
                ],
                modifiers: [SyntaxKind.AsyncKeyword],
                kind: SyntaxKind.ArrowFunction,
                params: []
              };
              trait.update(meta.value);
            }
          }}>
            Navigate to
          </Menu.Item>
          <Menu.Item icon="code-block" onSelect={async () => {
            const toggle = _.get(toggleRef, "current");
            toggle();
            const exp = await promptExpression({
              returnExp: true,
              local: true,
              async: true,
              value: generateSource(_.get(trait, 'rawValue.body.0'))
            });
            if (exp.expression) {
              meta.value = {
                body: [exp.expression
                ],
                kind: SyntaxKind.ArrowFunction,
                modifiers: [SyntaxKind.AsyncKeyword],
                params: []
              };
              applyImport(exp.imports);
              trait.update(meta.value);
            }
          }}>
            Execute Expression
          </Menu.Item>
          <Menu.Item icon="edit" onSelect={() => {
            const toggle = _.get(toggleRef, "current");
            toggle();
            trait.editor.jsx = true;
          }}>
            Edit Code
          </Menu.Item>
        </Menu>
      </div>}>
      {({ toggle, getRef, isShown }: any) => {
        toggleRef.current = toggle;
        return (
          <Tooltip
            content={
              <code style={{ color: "white", fontSize: 9, whiteSpace: 'pre-wrap' }}>{`{${generateSource(
                trait.rawValue
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
                position: "relative"
              }}
            >
              <IconButton
                icon="function"
                height={20}
                innerRef={getRef}
                flex={1}
                onClick={() => { toggle() }}
              />
            </Pane>
          </Tooltip>
        );
      }}
    </Popover>
  );
});
