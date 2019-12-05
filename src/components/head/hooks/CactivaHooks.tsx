import { EditHasuraLine, EditRestApiLine, ParseExpressionLine } from "@src/components/traits/expression/ExpressionListPopup";
import api from "@src/libs/api";
import editor from "@src/store/editor";
import { Button, Icon, IconButton, Menu, Pane, Popover, Tooltip } from "evergreen-ui";
import _ from "lodash";
import { observable } from "mobx";
import { observer } from "mobx-react-lite";
import { deepObserve } from "mobx-utils";
import typescript from "prettier/parser-typescript";
import prettier from "prettier/standalone";
import React, { useEffect, useRef } from "react";
import { applyImportAndHook } from "../../editor/utility/elements/tools";
import { generateSource } from "../../editor/utility/parser/generateSource";
import { promptCode } from "../../traits/expression/CodeEditor";
import { promptHasura } from "../../traits/expression/Hasura";
import { promptRestApi } from "../../traits/expression/RestApi";
import ItemDraggable from "./ItemDraggable";
import ItemDroppable from "./ItemDroppable";

const processHook = (item: any) => {
  let name = generateSource(item).split("(")[0];
  if (name.indexOf("useAsyncEffect") >= 0) {
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

        if (
          hook.name === "Code..." &&
          item.value.indexOf("useAsyncEffect") >= 0
        ) {
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

const AddNew = observer(({ toggleRef, hooks, toggleFirst, title }: any) => {
  const toggle = toggleRef.current;
  return (
    <div
      className="ctree-menu"
      style={{ margin: "-4px -8px", borderRadius: 5 }}
    >
      <Menu>
        <Menu.Item style={{ textAlign: "center", background: "white" }}>
          {title || "Add New Hook"}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          icon="globe"
          onSelect={async () => {
            if (toggleFirst) toggle();
            const restapi: any = await promptRestApi();
            const res: any = await api.post("morph/parse-exp", {
              value: `useAsyncEffect(async () => { ${restapi.source} } ,[])`
            });
            if (res && editor.current) {
              applyImportAndHook({
                useAsyncEffect: { from: "use-async-effect", type: "default" }
              });
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
              value: `useAsyncEffect(async () => { ${restapi.source} } ,[])`
            });
            if (res && editor.current) {
              applyImportAndHook({
                useAsyncEffect: { from: "use-async-effect", type: "default" }
              });
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
                applyImportAndHook({
                  useEffect: { from: "React", type: "named" }
                });
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
          if (item) {
            return (
              <RenderHookItem
                key={key}
                hooks={hooks}
                index={key}
                rawItem={rawItem}
                toggleRef={toggleRef}
              ></RenderHookItem>
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

const AddBtn = observer(({ label }: any) => {
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
        {label || "Add Hook"}
      </div>
    </Button>
  );
});

const RenderHookItem = observer(({ rawItem, index, hooks, toggleRef }: any) => {
  const item = rawItem.item;
  const hook = rawItem.hook;
  const childs = getChilds(item);
  if (childs) {
    return (
      <Tooltip
        position="left"
        appearance="card"
        content={
          <RenderChild childs={childs} toggleRef={toggleRef}></RenderChild>
        }
      >
        <Menu.Item>
          <HookItem
            hooks={hooks}
            index={index}
            item={item}
            hook={hook}
            toggleRef={toggleRef}
            isChild={true}
          ></HookItem>
        </Menu.Item>
      </Tooltip>
    );
  }
  return (
    <Menu.Item>
      <HookItem
        hooks={hooks}
        index={index}
        item={item}
        hook={hook}
        toggleRef={toggleRef}
      ></HookItem>
    </Menu.Item>
  );
});

const HookItem = observer(
  ({ item, hook, index, hooks, toggleRef, isChild }: any) => {
    return (
      <ItemDraggable dragInfo={item} source={hooks}>
        <ItemDroppable dropInfo={item}>
          <div
            style={{
              marginLeft: -20,
              paddingLeft: isChild ? 12 : 20,
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              borderLeft: isChild ? "8px solid #1070ca" : undefined
            }}
            onClick={async () => {
              const toggle = toggleRef.current;
              toggle();

              if (hook.name.indexOf("Rest API") >= 0) {
                const source = await generateSource(
                  _.get(item, "arguments.0.body.0", {})
                );
                const parsed = await EditRestApiLine(source);
                applyImportAndHook(parsed.imports);
                _.set(item, "arguments.0.body.0", parsed.source);
              } else if (hook.name.indexOf("Hasura GraphQL") >= 0) {
                console.log(item);

                const source = await generateSource(
                  _.get(item, "arguments.0.body.0", {})
                );
                const parsed = await EditHasuraLine(source);
                applyImportAndHook(parsed.imports);
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
                  hooks[index] = res;
                }
              }
              toggle();
            }}
          >
            <div
              style={{
                paddingRight: 10
              }}
            >
              #{index + 1}
            </div>
            <div
              style={{
                flex: 1,
                fontSize: "11px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 120
              }}
            >
              {hook.name}
            </div>
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
                  hooks.splice(index, 1);
                }
              }}
              iconSize={12}
              appearance="minimal"
              intent="danger"
            />
          </div>
        </ItemDroppable>
      </ItemDraggable>
    );
  }
);

const RenderChild = observer(({ childs: items, toggleRef }: any) => {
  return (
    <div
      className="ctree-menu"
      style={{
        margin: "-4px -8px",
        borderRadius: 5,
        right: 10,
        overflow: "hidden"
      }}
    >
      <Menu>
        {Array.isArray(items) &&
          items.map((item: any, key: number) => {
            let value = _.get(item, "value", "");
            if (typeof value !== "string") {
              value = generateSource(value);
            }
            const lineExp = ParseExpressionLine({ ...item, value });
            const childs = getChilds(item);
            if (childs) {
              return (
                <Tooltip
                  key={key}
                  position="left"
                  appearance="card"
                  content={
                    <RenderChild
                      childs={childs}
                      toggleRef={toggleRef}
                    ></RenderChild>
                  }
                >
                  <Menu.Item>
                    <HookItem
                      hooks={items}
                      index={key}
                      item={item}
                      hook={lineExp}
                      toggleRef={toggleRef}
                      isChild={true}
                    ></HookItem>
                  </Menu.Item>
                </Tooltip>
              );
            }
            return (
              <Menu.Item key={key}>
                <HookItem
                  hooks={items}
                  index={key}
                  item={item}
                  hook={lineExp}
                  toggleRef={toggleRef}
                ></HookItem>
              </Menu.Item>
            );
          })}

        <Menu.Divider />
        <Tooltip
          position="left"
          appearance="card"
          content={
            <AddNew
              hooks={items}
              toggleRef={toggleRef}
              title={"Add New Block"}
            />
          }
        >
          <Pane>
            <AddBtn hooks={items} toggleRef={toggleRef} label={"Add Block"} />
          </Pane>
        </Tooltip>
      </Menu>
    </div>
  );
});

const getChilds = (item: any) => {
  if ([202, 198, 192].indexOf(item.value.kind) > -1) {
    let childs = _.get(item, "value.body", []);
    if ([192].indexOf(item.value.kind) > -1)
      childs = _.get(item, "value.arguments[0].body", []);
    if ([202].indexOf(item.value.kind) > -1)
      childs = _.get(item, "value.value.arguments[0].body", []);
    if (childs.length > 0) return childs;
  }
  return null;
};
