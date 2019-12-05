import { promptCustomComponent } from "@src/components/editor/CactivaCustomComponent";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";
import api from "@src/libs/api";
import editor from "@src/store/editor";
import {
  Button,
  Checkbox,
  Icon,
  IconButton,
  Menu,
  Pane,
  Popover,
  Tooltip
} from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import { promptCode } from "./CodeEditor";
import { promptHasura } from "./Hasura";
import { promptRestApi } from "./RestApi";
import {
  prepareChanges,
  commitChanges,
  applyImportAndHook
} from "@src/components/editor/utility/elements/tools";
import { toJS } from "mobx";

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
        lineCount > 0 ? (
          <LineItem
            lines={lines}
            path={path}
            toggleRef={toggleRef}
            meta={meta}
            update={update}
          />
        ) : (
          <AddNew
            toggleRef={toggleRef}
            meta={meta}
            update={update}
            path={path}
          />
        )
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
                  style={{
                    color: "white",
                    fontSize: 9,
                    whiteSpace: "pre-wrap"
                  }}
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
                  style={{
                    color: "white",
                    fontSize: 9,
                    whiteSpace: "pre-wrap"
                  }}
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
  const toggle = _.get(toggleRef, "current");

  return (
    <div className="ctree-menu">
      <Menu>
        {lines.map((item: any, key: number) => {
          let value = _.get(item, "value", "");
          if (typeof value !== "string") {
            value = generateSource(value);
          }
          const lineExp = ParseExpressionLine({ ...item, value });
          if (item && item.kind) {
            return (
              <Menu.Item
                key={key}
                onSelect={async e => {
                  toggle();

                  if (lineExp.name.indexOf("Hasura GraphQL") >= 0) {
                    const body = _.get(meta.value, path);
                    const parsed = await EditHasuraLine(lineExp.value);
                    applyImportAndHook(parsed.imports);
                    prepareChanges(editor.current);
                    body[key] = parsed.source;
                    commitChanges(editor.current);
                  } else if (lineExp.name.indexOf("Rest API") >= 0) {
                    const body = _.get(meta.value, path);
                    const parsed = await EditRestApiLine(lineExp.value);
                    applyImportAndHook(parsed.imports);
                    prepareChanges(editor.current);
                    body[key] = parsed.source;
                    commitChanges(editor.current);
                  } else {
                    const code = await promptCode(generateSource(item));
                    console.log(code);
                    if (code !== null) {
                      const res = await api.post("morph/parse-exp", {
                        value: code
                      });
                      const body = _.get(meta.value, path);
                      prepareChanges(editor.current);
                      body[key] = res;
                      commitChanges(editor.current);
                    }
                  }
                }}
              >
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
                    {lineExp.name}
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
                        prepareChanges(editor.current);
                        const body = _.get(meta.value, path);
                        body.splice(key, 1);
                        commitChanges(editor.current);
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
        <Menu.Item
          icon="edit"
          onSelect={() => {
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
            <AddLine
              toggleRef={ltRef}
              meta={meta}
              update={update}
              path={path}
            />
          }
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
                <div style={{ flex: 1, fontSize: "11px", textAlign: "left" }}>
                  Add Statement
                </div>
              </Button>
            );
          }}
        </Popover>
      </Menu>
    </div>
  );
});

const AddLine = observer(({ toggleRef, meta, update, path }: any) => {
  const toggle = _.get(toggleRef, "current");
  return (
    <div className="ctree-menu">
      <Menu>
        <Menu.Item
          icon="link"
          onSelect={async () => {
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
              prepareChanges(editor.current);
              body.push({
                kind: SyntaxKind.ExpressionStatement,
                value: `nav.${meta.navigateType}(${
                  meta.navigateType === "goBack"
                    ? ""
                    : `"${name.substr(5, name.length - 9)}"`
                });`
              });
              commitChanges(editor.current);
            }
          }}
        >
          Navigate to
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          icon="globe"
          onSelect={async () => {
            toggle();
            const body = _.get(meta.value, path);
            const restapi: any = await promptRestApi();
            const res = await api.post("morph/parse-exp", {
              value: restapi.source
            });
            prepareChanges(editor.current);
            body.push(res);
            commitChanges(editor.current);
          }}
        >
          Call REST API
        </Menu.Item>
        <Menu.Item
          icon="satellite"
          onSelect={async () => {
            toggle();
            const body = _.get(meta.value, path);
            const hapi: any = await promptHasura();
            const res = await api.post("morph/parse-exp", {
              value: hapi.source
            });
            prepareChanges(editor.current);
            body.push(res);
            commitChanges(editor.current);
          }}
        >
          Call Hasura GraphQL
        </Menu.Item>
      </Menu>
    </div>
  );
});

const AddNew = observer(({ toggleRef, meta, update, path }: any) => {
  return (
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
          icon="globe"
          onSelect={async () => {
            const restapi: any = await promptRestApi();
            const res = await api.post("morph/parse-exp", {
              value: restapi.source
            });
            meta.value = {
              body: [res],
              modifiers: [SyntaxKind.AsyncKeyword],
              kind: SyntaxKind.ArrowFunction,
              params: []
            };
            update(meta.value);
          }}
        >
          Call REST API
        </Menu.Item>
        <Menu.Item
          icon="satellite"
          onSelect={async () => {
            const restapi: any = await promptHasura();
            const res = await api.post("morph/parse-exp", {
              value: restapi.source
            });
            meta.value = {
              body: [res],
              modifiers: [SyntaxKind.AsyncKeyword],
              kind: SyntaxKind.ArrowFunction,
              params: []
            };
            update(meta.value);
          }}
        >
          Call Hasura GraphQL
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
          Edit Component Code
        </Menu.Item>
      </Menu>
    </div>
  );
});

export const ParseExpressionLine = (item: any) => {
  let name = "Code...";
  let value = "";
  if (item.left && item.right) {
    if (item.right.value.indexOf("await api") >= 0) {
      name = `${item.left.value} = Rest API`;
      value = generateSource(item);
    } else if (item.right.value.indexOf("await query") >= 0) {
      name = `${item.left.value} = Hasura GraphQL`;
      value = generateSource(item);
    }
  } else if (item.value) {
    const vname =
      item.value.indexOf("=") > 0
        ? item.value.split("=")[0].trim() + " = "
        : "";

    if (item.value.indexOf("await api") >= 0) {
      name = `${vname} Rest API`;

      value = item.value;
    } else if (item.value.indexOf("await query") >= 0) {
      name = `${vname} Hasura GraphQL`;
      value = item.value;
    } else if (item.value.indexOf(".map(") >= 0) {
      let splitv = vname.split(".map(");
      name = `${splitv[0]}.map`;
      value = item.value;
    }
  }

  return {
    name,
    value
  };
};

export const EditHasuraLine = async (value: string) => {
  const lts = value.split("await query");
  const str = "query" + lts[lts.length - 1];
  const res = await api.post("morph/parse-exp", {
    value: str
  });
  const hasura = {
    query: _.trim(_.get(res, "arguments.0.value"), "'`\""),
    auth: _.trim(_.get(res, "arguments.1.value.auth.value"), "'`\""),
    payload: generateSource(_.get(res, "arguments.1.value.payload")),
    setVar: lts.length > 1 ? lts[0].trim().replace("=", "") : undefined
  } as any;
  const restapi: any = await promptHasura(hasura);
  const parsed = await api.post("morph/parse-exp", {
    value: restapi.source
  });
  return { source: parsed, imports: restapi.imports };
};

export const EditRestApiLine = async (value: string) => {
  const lts = value.split("await api");
  const str = "api" + lts[lts.length - 1];
  const res = await api.post("morph/parse-exp", {
    value: str
  });
  const rest = {} as any;
  const rargs = _.get(res, "arguments.0.value");
  if (rargs) {
    rest.url = generateSource(_.get(rargs, "url"));
    rest.method = _.trim(generateSource(_.get(rargs, "method")), "'`\"");
    rest.request = {
      body: generateSource(_.get(rargs, "data")),
      headers: generateSource(_.get(rargs, "headers"))
    };
    rest.onError = generateSource(_.get(rargs, "onError"));
    if (lts.length > 1) {
      rest.setVar = lts[0].trim().replace("=", "");
    }
  }
  const restapi: any = await promptRestApi(rest);
  const parsed = await api.post("morph/parse-exp", {
    value: restapi.source
  });
  return {
    source: parsed,
    imports: restapi.imports
  };
};
