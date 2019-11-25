import React, { useRef } from "react";
import {
  Popover,
  Menu,
  Icon,
  Button,
  IconButton,
  Pane,
  Tooltip
} from "evergreen-ui";
import { observer, useObservable } from "mobx-react-lite";
import editor from "@src/store/editor";
import { generateSource } from "../editor/utility/parser/generateSource";
import _ from "lodash";
import { promptRestApi } from "../traits/expression/RestApi";
import api from "@src/libs/api";
import { promptHasura } from "../traits/expression/Hasura";
import { promptCode } from "../traits/expression/CodeEditor";

export default observer(({ children }: any) => {
  const toggleRef = useRef(null as any);
  const toggle = toggleRef.current;
  const hooks = editor.current ? editor.current.hooks : [];
  const ltRef = useRef(null as any);
  return (
    <Popover
      content={
        <div
          className="ctree-menu"
          onSelect={() => {
            toggle();
          }}
        >
          <Menu>
            {hooks.map((item: any, key: number) => {
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
                    >
                      <div
                        style={{
                          flexBasis: "27px",
                          minWidth: "27px"
                        }}
                      >{`#${key + 1}`}</div>
                      <div style={{ flex: 1, fontSize: "11px" }}>
                        {generateSource(item).split("(")[0]}
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
            <Popover
              position={"left"}
              minWidth={100}
              content={<AddNew toggleRef={ltRef} />}
            >
              {({ toggle, getRef, isShown }: any) => {
                ltRef.current = toggle;
                return (
                  <Button
                    innerRef={getRef}
                    onClick={() => {
                      toggle();
                    }}
                    style={{
                      display: "flex",
                      width: "100%",
                      flexDirection: "row",
                      boxShadow: "none",
                      justifyContent: "flex-start"
                    }}
                    appearance="minimal"
                  >
                    <Icon
                      icon="small-plus"
                      style={{
                        flexBasis: "30px",
                        minWidth: "30px",
                        marginLeft: "-10px",
                        marginRight: "8px"
                      }}
                    />
                    <div
                      style={{ flex: 1, fontSize: "11px", textAlign: "left" }}
                    >
                      Add Hook
                    </div>
                  </Button>
                );
              }}
            </Popover>
          </Menu>
        </div>
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

const AddNew = observer(({ toggleRef }: any) => {
  const toggle = toggleRef.current;
  const meta = useObservable({
    value: ""
  });
  return (
    <div className="ctree-menu">
      <Menu>
        <Menu.Item
          icon="globe"
          onSelect={async () => {
            toggle();
            const restapi: any = await promptRestApi();
            const res = await api.post("morph/parse-exp", {
              value: restapi.source
            });
            console.log(res);
          }}
        >
          Call REST API
        </Menu.Item>
        <Menu.Item
          icon="satellite"
          onSelect={async () => {
            toggle();
            const restapi: any = await promptHasura();
            const res = await api.post("morph/parse-exp", {
              value: restapi.source
            });
            console.log(res);
          }}
        >
          Call Hasura GraphQL
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          icon="new-text-box"
          onSelect={async () => {
            const source = await promptCode();
            const res = await api.post("morph/parse-exp", {
              value: source
            });
            console.log(res);
          }}
        >
          Custom Code Hook
        </Menu.Item>
      </Menu>
    </div>
  );
});
