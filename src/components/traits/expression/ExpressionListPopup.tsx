import { promptCustomComponent } from "@src/components/editor/CactivaCustomComponent";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import { SyntaxKind, getSyntaxKindName } from "@src/components/editor/utility/syntaxkinds";
import editor from "@src/store/editor";
import { Checkbox, Menu, Popover, Tooltip, Text, Button, Icon, IconButton, Pane } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import { promptCode } from "./CodeEditor";
import api from "@src/libs/api";
import { prepareChanges, commitChanges } from "@src/components/editor/utility/elements/tools";
import { promptRestApi } from "./RestApi";

export default observer(({ source, children, update, path }: any) => {
  const toggleRef = useRef(null as any);
  const meta = useObservable({
    value: source,
    navigateType: "navigate"
  });
  const lines = _.get(source, `${path}`, []);
  const lineCount = lines.length;
  return (
    <Popover
      position={"left"}
      minWidth={100}
      content={
        lineCount > 0 ?
          <LineItem lines={lines} path={path} toggleRef={toggleRef} meta={meta} update={update} />
          :
          <AddNew toggleRef={toggleRef} meta={meta} update={update} />
      }
    >
      {({ toggle, getRef, isShown }: any) => {
        toggleRef.current = toggle;
        if (lineCount > 0) {
          return (
            <Tooltip
              position="left"
              content={
                <code
                  style={{ color: "white", fontSize: 9, whiteSpace: "pre-wrap" }}
                >{`${lineCount} line of code...`}</code>
              }
            >
              {children(toggle, getRef)}
            </Tooltip>
          );
        } else {
          return (
            <Tooltip
              position="left"
              content={
                <code
                  style={{ color: "white", fontSize: 9, whiteSpace: "pre-wrap" }}
                >{`{${generateSource(source)}}`}</code>
              }
            >
              {children(toggle, getRef)}
            </Tooltip>
          );
        }
      }}
    </Popover>
  );
});

const LineItem = observer(({ lines, toggleRef, meta, update, path }: any) => {
  const ltRef = useRef(null as any);
  return <div className="ctree-menu">
    <Menu>
      {lines.map((item: any, key: number) => {
        if (item && item.kind) {
          return <Menu.Item key={key} onSelect={async e => {
            const code = await promptCode(generateSource(item));
            if (code !== null) {
              const res = await api.post("morph/parse-exp", { value: code });
              const body = _.get(meta.value, path);
              body[key] = res;
              update(meta.value);
            }
          }}>
            <Tooltip
              position="left"
              content={
                <code
                  style={{ color: "white", fontSize: 9, whiteSpace: "pre-wrap" }}
                >{`${generateSource(item)}`}</code>
              }
            >
              <Pane style={{
                marginLeft: -20,
                paddingLeft: 20,
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: 'center'
              }}>
                <div style={{
                  flexBasis: '27px', minWidth: '27px'
                }}>{`#${key + 1}`}</div>
                <div style={{ flex: 1, fontSize: '11px' }}>{getSyntaxKindName(item.kind)}</div>
                <IconButton icon={"trash"} style={{
                  boxShadow: 'none',
                  margin: '0 -10px 0 10px',
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
                      const body = _.get(meta.value, path);
                      body.splice(key, 1);
                      update(meta.value);
                    }
                  }}
                  iconSize={12}
                  appearance="minimal"
                  intent="danger" />
              </Pane>
            </Tooltip>
          </Menu.Item>
        }
      })}
      <Menu.Divider />
      <Menu.Item
        icon="edit"
        onSelect={() => {
          const toggle = _.get(toggleRef, "current");
          toggle();
          if (editor && editor.current) editor.current.jsx = true;
        }}
      >
        Edit Component Code
    </Menu.Item>
      <Menu.Divider />
      <Popover
        position={"left"}
        minWidth={100}
        content={
          <AddLine toggleRef={ltRef} meta={meta} update={update} path={path} />
        }
      >
        {({ toggle, getRef, isShown }: any) => {
          ltRef.current = toggle;
          return <Button
            innerRef={getRef}
            onClick={() => {
              toggle();
            }}
            style={{ display: "flex", width: '100%', flexDirection: "row", boxShadow: 'none', justifyContent: "flex-start" }}
            appearance="minimal">
            <Icon icon="small-plus" style={{
              flexBasis: '30px', minWidth: '30px',
              marginLeft: '-10px',
              marginRight: '8px'
            }} />
            <div style={{ flex: 1, fontSize: '11px', textAlign: 'left' }}>Add Statement</div>
          </Button>
        }}
      </Popover>
    </Menu>
  </div >;
});

const AddLine = observer(({ toggleRef, meta, update, path }: any) => {
  return <div className="ctree-menu">
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
            const body = _.get(meta.value, path);
            body.push(
              {
                kind: SyntaxKind.ExpressionStatement,
                value: `nav.${meta.navigateType}(${
                  meta.navigateType === "goBack"
                    ? ""
                    : `"${name.substr(5, name.length - 9)}"`
                  });`
              });
            update(meta.value);
          }
        }}
      >
        Navigate to
    </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        icon="globe"
        onSelect={() => {
          promptRestApi();
        }}
      >Call REST API</Menu.Item>
      <Menu.Item
        icon="satellite"
      >Call Hasura GraphQL</Menu.Item>
    </Menu>
  </div>
})

const AddNew = observer(({ toggleRef, meta, update }: any) => {
  return <div className="ctree-menu">
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
        icon="globe"
        onSelect={() => {
          promptRestApi();
        }}
      >Call REST API</Menu.Item>
      <Menu.Item
        icon="satellite"
      >Call Hasura GraphQL</Menu.Item>
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
        Edit Component Code
    </Menu.Item>
    </Menu>
  </div>
})