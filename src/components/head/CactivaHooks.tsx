import {
  EditHasuraLine,
  EditRestApiLine,
  ParseExpressionLine
} from "@src/components/traits/expression/ExpressionListPopup";
import api from "@src/libs/api";
import editor from "@src/store/editor";
import {
  Button,
  Icon,
  IconButton,
  Menu,
  Pane,
  Popover,
  Tooltip
} from "evergreen-ui";
import _ from "lodash";
import { observable } from "mobx";
import { observer } from "mobx-react-lite";
import typescript from "prettier/parser-typescript";
import prettier from "prettier/standalone";
import React, { useEffect, useRef } from "react";
import { applyImport } from "../editor/utility/elements/tools";
import { generateSource } from "../editor/utility/parser/generateSource";
import { promptCode } from "../traits/expression/CodeEditor";
import { promptHasura } from "../traits/expression/Hasura";
import { promptRestApi } from "../traits/expression/RestApi";
import { deepObserve } from "mobx-utils";

const processHook = (item: any) => {
  let name = generateSource(item).split("(")[0];
  if (name.indexOf("useEffect") >= 0) {
    const source = _.get(item, "arguments.0.body.0", {});
    if (source) {
      return ParseExpressionLine(source);
    }
  }

  return { name };
};

const meta = observable({
  hooks: [] as any
});

export default observer(({ children }: any) => {
  const toggleRef = useRef(null as any);
  const hooks: any = editor.current ? editor.current.hooks : [];

  useEffect(() => {
    const refreshHooks = () => {
      meta.hooks = hooks.map((item: any, key: number) => {
        const hook = processHook(item);

        if (hook.name === "Code..." && item.value.indexOf("useEffect") >= 0) {
          (async () => {
            const res: any = await api.post("morph/parse-exp", {
              value: item.value
            });
            meta.hooks[key] = {
              item: res,
              hook: processHook(res)
            } as any;
          })();
        }

        return {
          item: item,
          hook
        };
      });
    };
    const disposer = deepObserve(hooks, (change, path) => {
      refreshHooks();
    });
    refreshHooks();
    return disposer;
  }, [hooks]);

  return (
    <Popover
      animationDuration={0}
      content={
        hooks.length === 0 ? (
          <AddNew hooks={hooks} toggleRef={toggleRef} toggleFirst={true} />
        ) : (
          <HookMenu hooks={hooks} toggleRef={toggleRef} />
        )
      }
    >
      {({ toggle, getRef, isShown }: any) => {
        toggleRef.current = toggle;
        return (
          <>
            <Tooltip appearance="card" content="Component Hooks">
              <Pane>
                <IconButton
                  innerRef={getRef}
                  onClick={() => toggle()}
                  className="hook-btn"
                  icon={"pivot"}
                />
              </Pane>
            </Tooltip>
            {isShown && (
              <div
                onClick={() => {
                  toggle();
                }}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  zIndex: 11
                }}
              ></div>
            )}
          </>
        );
      }}
    </Popover>
  );
});

const AddNew = observer(({ toggleRef, hooks, toggleFirst }: any) => {
  const toggle = toggleRef.current;
  return (
    <div
      className="ctree-menu"
      style={{ margin: "-4px -8px", borderRadius: 5 }}
    >
      <Menu>
        <Menu.Item style={{ textAlign: "center", background: "white" }}>
          Add New Hook
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          icon="globe"
          onSelect={async () => {
            if (toggleFirst) toggle();
            const restapi: any = await promptRestApi();
            const res: any = await api.post("morph/parse-exp", {
              value: `useEffect(() => { ${restapi.source} } ,[])`
            });
            if (res && editor.current) {
              applyImport({ useEffect: { from: "React", type: "named" } });
              hooks.push(res);
            }
            toggle();
          }}
        >
          Call REST API
        </Menu.Item>
        <Menu.Item
          icon="satellite"
          onSelect={async () => {
            if (toggleFirst) toggle();
            const restapi: any = await promptHasura();
            const res = await api.post("morph/parse-exp", {
              value: `useEffect(() => { ${restapi.source} } ,[])`
            });
            if (res && editor.current) {
              applyImport({ useEffect: { from: "React", type: "named" } });
              hooks.push(res);
            }
            toggle();
          }}
        >
          Call Hasura GraphQL
        </Menu.Item>
        <Menu.Item
          icon="new-text-box"
          onSelect={async () => {
            if (toggleFirst) toggle();
            const source = await promptCode();
            if (source) {
              const res = await api.post("morph/parse-exp", {
                value: source
              });
              if (editor.current) {
                applyImport({ useEffect: { from: "React", type: "named" } });
                hooks.push(res);
              }
            }
            toggle();
          }}
        >
          Custom Code Hook
        </Menu.Item>
      </Menu>
    </div>
  );
});

const HookMenu = observer(({ hooks, toggleRef }: any) => {
  return (
    <div className="ctree-menu">
      <Menu>
        {meta.hooks.map((rawItem: any, key: number) => {
          const item = rawItem.item;
          const h = rawItem.hook;
          if (item) {
            return (
              <Menu.Item key={key}>
                <Pane
                  style={{
                    marginLeft: -20,
                    paddingLeft: 20,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center"
                  }}
                  onClick={async () => {
                    const toggle = toggleRef.current;
                    toggle();

                    if (h.name.indexOf("Rest API") >= 0) {
                      const source = await generateSource(
                        _.get(item, "arguments.0.body.0", {})
                      );
                      const parsed = await EditRestApiLine(source);
                      applyImport(parsed.imports);
                      _.set(item, "arguments.0.body.0", parsed.source);
                    } else if (h.name.indexOf("Hasura GraphQL") >= 0) {
                      const source = await generateSource(
                        _.get(item, "arguments.0.body.0", {})
                      );
                      const parsed = await EditHasuraLine(source);
                      applyImport(parsed.imports);
                      _.set(item, "arguments.0.body.0", parsed.source);
                    } else {
                      const source = await generateSource(item);
                      const code = prettier.format(source, {
                        parser: "typescript",
                        plugins: [typescript]
                      });
                      const src = await promptCode(code);
                      if (src) {
                        const res = await api.post("morph/parse-exp", {
                          value: src
                        });
                        hooks[key] = res;
                      }
                    }
                    toggle();
                  }}
                >
                  <Icon
                    icon={
                      h.name.indexOf("Hasura GraphQL") >= 0
                        ? "satellite"
                        : h.name.indexOf("Rest API") >= 0
                        ? "globe"
                        : "new-text-box"
                    }
                    color="#aaa"
                    flexBasis={15}
                    marginLeft={-2}
                    marginRight={13}
                  />
                  <div style={{ flex: 1, fontSize: "11px" }}>{h.name}</div>
                  <IconButton
                    icon={"trash"}
                    style={{
                      boxShadow: "none",
                      margin: "0 -10px 0 10px",
                      padding: 0,
                      width: 24,
                      height: 24,
                      minWidth: 0,
                      minHeight: 0
                    }}
                    onClick={(e: any) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (confirm("Are you sure ?")) {
                        hooks.splice(key, 1);
                      }
                    }}
                    iconSize={12}
                    appearance="minimal"
                    intent="danger"
                  />
                </Pane>
              </Menu.Item>
            );
          }
        })}

        <Menu.Divider />
        <Tooltip
          position="left"
          appearance="card"
          content={<AddNew hooks={hooks} toggleRef={toggleRef} />}
        >
          <Pane>
            <AddBtn hooks={hooks} toggleRef={toggleRef} />
          </Pane>
        </Tooltip>
      </Menu>
    </div>
  );
});

const AddBtn = observer(({  }: any) => {
  return (
    <Button
      style={{
        display: "flex",
        width: "100%",
        flexDirection: "row",
        boxShadow: "none",
        cursor: "default",
        justifyContent: "flex-start"
      }}
      appearance="minimal"
    >
      <Icon
        icon="chevron-left"
        style={{
          flexBasis: "30px",
          minWidth: "30px",
          marginLeft: "-10px",
          marginRight: "8px"
        }}
      />
      <div style={{ flex: 1, fontSize: "11px", textAlign: "left" }}>
        Add Hook
      </div>
    </Button>
  );
});
