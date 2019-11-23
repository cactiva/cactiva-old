import { promptExpression } from "@src/components/editor/CactivaExpressionDialog";
import editor from "@src/store/editor";
import Axios from "axios";
import {
  Alert,
  Button,
  Dialog,
  Icon,
  Pane,
  SelectMenu,
  Tab,
  Tablist,
  TextInput
} from "evergreen-ui";
import _ from "lodash";
import { observable, toJS } from "mobx";
import { observer, useObservable } from "mobx-react-lite";
import { default as React, useEffect, useRef } from "react";
import MonacoEditor from "react-monaco-editor";
import "./RestApi.scss";
import { promptCode } from "./CodeEditor";
const form = {
  url: "",
  method: "get",
  request: {
    header: "",
    body: ""
  },
  response: {
    url: "",
    status: 0,
    statusText: "",
    header: "",
    body: ""
  },
  onError: null,
  setVar: "",
  imports: [] as any
};
const meta = observable({
  language: "javascript",
  form: _.cloneDeep(form),
  lastForm: null as any,
  resolve: null as any
});
export default () => {
  return (
    <Dialog
      isShown={true}
      hasHeader={false}
      hasFooter={false}
      preventBodyScrolling
      shouldCloseOnEscapePress={false}
      onCloseComplete={() => {
        editor.modals.restApi = false;
        const varname = meta.form.setVar ? `${meta.form.setVar} = ` : "";
        const header = meta.form.request.header;
        const body = meta.form.request.body;
        const onError = meta.form.onError;
        let url = meta.form.url;
        if (
          url.indexOf("'") < 0 &&
          url.indexOf('"') < 0 &&
          url.indexOf("`") < 0
        ) {
          url = `'${url}'`;
        }

        const result = {
          source: ` ${varname} await api({
    method: '${meta.form.method}',
    url: ${url},
    ${header ? `headers: ${header},` : ""}
    ${body ? `data: ${body},` : ""}
    ${onError ? `onError: ${onError},` : ""}
});
            `,
          imports: {
            ...meta.form.imports,
            api: {
              from: "@src/libs/utils/api",
              type: "default"
            }
          }
        };
        if (meta.resolve) {
          meta.resolve(result);
        }
      }}
      minHeightContent={500}
      width={800}
    >
      <div className="cactiva-dialog-editor">
        <RestApiForm form={meta.form} />
      </div>
    </Dialog>
  );
};

export const promptRestApi = (data?: {
  url: string;
  method: string;
  onError: string;
  request: {
    body: string;
    header: string;
  };
  setVar: string;
}) => {
  editor.modals.restApi = true;
  meta.lastForm = meta.form;

  if (data) {
    _.set(meta, "form.onError", data.onError);
    _.set(meta, "form.method", data.method);
    _.set(meta, "form.url", data.url);
    _.set(meta, "form.request", data.request);
    _.set(meta, "form.setVar", data.setVar);
  } else {
    let url = meta.form.url;
    meta.form = _.cloneDeep(form);
    meta.form.url = url;
  }

  if (
    ["`", "'", '"'].indexOf(meta.form.url[0]) >= 0 &&
    meta.form.url[0] === meta.form.url[meta.form.url.length - 1]
  ) {
    meta.form.url = _.trim(meta.form.url, "'\"`");
  }

  return new Promise(resolve => {
    meta.resolve = resolve;
  });
};

const RestApiForm = observer(({ form }: any) => {
  const tabs = ["Header", "Body"];
  const meta = useObservable({
    w: 0,
    h: 0,
    tab: 1
  });
  const ref = useRef(null as any);
  useEffect(() => {
    if (ref && ref.current) {
      setTimeout(() => {
        meta.w = ref.current.offsetWidth - 20;
        meta.h = ref.current.offsetHeight - 20;
      });
    }
  }, [ref.current, form.response.status]);

  const responseAlert = (
    <Alert
      intent={
        form.response.status >= 200 && form.response.status < 300
          ? "success"
          : "danger"
      }
      title={`${form.response.url} `}
    >{`HTTP Status: ${form.response.status} - ${form.response.statusText}`}</Alert>
  );

  return (
    <div className="rest-api-form">
      <div className="first">
        <TextInput
          value={form.url}
          style={{ flex: 1 }}
          placeholder="URL"
          onChange={(e: any) => {
            form.url = e.target.value;
          }}
        />
        <SelectMenu
          hasFilter={false}
          height={170}
          width={180}
          closeOnSelect={true}
          onSelect={e => {
            form.method = e.value;
          }}
          hasTitle={false}
          options={[
            "Get",
            "Post",
            "Put",
            "Head",
            "Delete",
            "Patch",
            "Options"
          ].map(label => ({ label, value: label.toLowerCase() }))}
        >
          <Button marginLeft={10}>
            {_.startCase(form.method)} <Icon icon="caret-down" />
          </Button>
        </SelectMenu>
      </div>
      <div className="reqres">
        <div className="tabs">
          <Tablist marginBottom={16} flexBasis={240} marginRight={24}>
            <div className="title">Request</div>{" "}
            {tabs.map((tab, index) => (
              <Tab
                key={tab}
                id={tab}
                onSelect={() => (meta.tab = index)}
                isSelected={index === meta.tab}
                aria-controls={`panel-${tab}`}
              >
                {tab}
              </Tab>
            ))}
          </Tablist>

          <Tablist marginBottom={16} flexBasis={240} marginRight={24}>
            <div className="title">Response</div>
            <Button
              className="small-btn"
              onClick={async (e: any) => {
                meta.tab = 3;
                form.response.status = 0;
                form.response.body = "Loading...";
                form.response.headers = "Loading...";
                const call = (Axios as any)[form.method];
                let res = null as any;
                let headers = {};
                let body = {};
                try {
                  headers = JSON.parse(form.request.headers);
                  body = JSON.parse(form.request.body);
                } catch (e) {}

                const config = editor.settings;
                let url = form.url;
                if (
                  url.indexOf("http") !== 0 &&
                  url.indexOf("`") < 0 &&
                  url.indexOf("'") < 0 &&
                  url.indexOf('"')
                ) {
                  url = `${config.backend.protocol}://${config.backend.host}:${config.backend.port}${url}`;
                }

                try {
                  if (
                    ["get", "delete", "head", "options"].indexOf(form.method) >=
                    0
                  )
                    res = await call(url, {
                      headers
                    });
                  else
                    res = await call(url, body, {
                      headers
                    });
                } catch (e) {
                  res = e.response;
                  console.log(e);
                }
                if (res) {
                  if (res.config) {
                    form.response.url = res.config.url;
                    if (res.config.url.indexOf("http") !== 0) {
                      form.response.url = location.href + res.config.url;
                    }
                  }

                  form.response.status = res.status;
                  form.response.statusText = res.statusText;
                  if (typeof res.data === "string") {
                    form.response.body = res.data;
                  } else {
                    form.response.body = JSON.stringify(res.data, null, 2);
                  }
                  form.response.header = JSON.stringify(res.headers, null, 2);
                }
              }}
            >
              Test
            </Button>
            {tabs.map((tab, index) => (
              <Tab
                key={tab}
                id={tab}
                onSelect={() => (meta.tab = 2 + index)}
                isSelected={index === meta.tab - 2}
                aria-controls={`panel-${tab}`}
              >
                {tab}
              </Tab>
            ))}
          </Tablist>
        </div>
        <div className="pane" ref={ref}>
          {
            ({
              0: (
                <Pane padding={16} background="#E9F2FB" flex="1">
                  <MonacoEditor
                    theme="vs-light"
                    width={meta.w}
                    height={meta.h}
                    value={form.request.header}
                    onChange={v => {
                      form.request.header = v;
                    }}
                    options={{ fontSize: 11, minimap: { enabled: false } }}
                    language={"json"}
                  />
                </Pane>
              ),
              1: (
                <Pane padding={16} background="#E9F2FA" flex="1">
                  <MonacoEditor
                    theme="vs-light"
                    width={meta.w}
                    height={meta.h}
                    value={form.request.body}
                    onChange={v => {
                      form.request.body = v;
                    }}
                    options={{ fontSize: 11, minimap: { enabled: false } }}
                    language={"json"}
                  />
                </Pane>
              ),
              2: (
                <Pane padding={16} background="#E9F2FC" flex="1">
                  {form.response.status > 0 && responseAlert}
                  <MonacoEditor
                    theme="vs-light"
                    width={meta.w}
                    height={meta.h - 65}
                    value={form.response.header}
                    onChange={v => {}}
                    options={{ fontSize: 11, minimap: { enabled: false } }}
                    language={"json"}
                  />
                </Pane>
              ),
              3: (
                <Pane padding={16} background="#E9F2FA" flex="1">
                  {form.response.status > 0 && responseAlert}
                  <MonacoEditor
                    theme="vs-light"
                    width={meta.w}
                    height={meta.h - 65}
                    value={form.response.body}
                    onChange={v => {}}
                    options={{ fontSize: 11, minimap: { enabled: false } }}
                    language={"json"}
                  />
                </Pane>
              )
            } as any)[meta.tab]
          }
        </div>
        <div className="last-row">
          <div className="set-result">
            Set result body to:
            <Button
              marginLeft={5}
              onClick={async () => {
                const res = await promptExpression({
                  value: form.setVar
                });
                form.setVar = res.expression;
                form.imports = res.imports;
              }}
            >
              {form.setVar === "" ? "[Empty Variable]" : form.setVar}
            </Button>
          </div>
          <Button
            marginLeft={5}
            intent={form.onError ? "success" : "none"}
            appearance={form.onError ? "primary" : "default"}
            onClick={async () => {
              const res = await promptCode(form.onError || `(e) => {\n    \n}`);
              if (res) {
                form.onError = res;
              }
            }}
          >
            On Error
          </Button>
        </div>
      </div>
    </div>
  );
});
