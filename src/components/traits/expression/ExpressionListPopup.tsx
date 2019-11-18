import { promptCustomComponent } from "@src/components/editor/CactivaCustomComponent";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import { Checkbox, Menu, Popover, Tooltip } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import editor from "@src/store/editor";
import { toJS } from "mobx";

export default observer(({ source, children, update }: any) => {
  const toggleRef = useRef(null as any);
  const meta = useObservable({
    value: source,
    navigateType: "navigate"
  });
  console.log(toJS(source));
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
                meta.navigateType = "navigate";
                const name = await promptCustomComponent({
                  header: observer(({ dismiss }: any) => (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: -10,
                        justifyContent: "space-between"
                      }}
                    >
                      <Checkbox
                        checked={meta.navigateType === "reset"}
                        onChange={e => {
                          if (meta.navigateType === "reset")
                            meta.navigateType = "navigate";
                          else meta.navigateType = "reset";
                        }}
                        label="Reset History"
                      />
                      <Checkbox
                        checked={meta.navigateType === "goBack"}
                        onChange={e => {
                          if (meta.navigateType === "goBack")
                            meta.navigateType = "navigate";
                          else {
                            meta.navigateType = "goBack";
                            dismiss();
                          }
                        }}
                        label="Navigate goBack()"
                      />
                    </div>
                  ))
                });
                if (name || meta.navigateType === "goBack") {
                  meta.value = {
                    body: [
                      {
                        kind: SyntaxKind.ExpressionStatement,
                        value: `nav.${meta.navigateType}(${
                          meta.navigateType === "goBack"
                            ? ""
                            : `"${name.substr(5, name.length - 9)}"`
                          });`
                      }
                    ],
                    modifiers: [SyntaxKind.AsyncKeyword],
                    kind: SyntaxKind.ArrowFunction,
                    params: []
                  };
                  update(meta.value);
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
                  update(meta.value);
                }
                if (editor && editor.current) editor.current.jsx = true;
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
              >{`{${generateSource(source)}}`}</code>
            }
          >
            {children(toggle, getRef)}
          </Tooltip>
        );
      }}
    </Popover>
  );
});
