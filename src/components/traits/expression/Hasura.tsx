import { promptExpression } from "@src/components/traits/expression/ExpressionSinglePopup";
import api from "@src/libs/api";
import editor from "@src/store/editor";
import { Dialog, Spinner } from "evergreen-ui";
import GraphiQL from "graphiql";
import GraphiQLExplorer from "graphiql-explorer";
import "graphiql/graphiql.css";
import { buildClientSchema } from "graphql";
import _ from "lodash";
import { observable } from "mobx";
import { observer } from "mobx-react-lite";
import { default as React, useRef, useEffect } from "react";
import "./Hasura.scss";
const form = {
  query: "",
  setVar: "",
  payload: "",
  auth: "login",
  imports: [] as any
};
const meta = observable({
  language: "javascript",
  form: _.cloneDeep(form),
  explorerIsOpen: true,
  schema: undefined as any,
  schemaLoading: true,
  lastForm: null as any,
  resolve: null as any
});
export default () => {
  const gref = useRef(null as any);
  return (
    <Dialog
      isShown={true}
      hasHeader={false}
      hasFooter={false}
      preventBodyScrolling
      shouldCloseOnEscapePress={false}
      onCloseComplete={() => {
        editor.modals.hasura = false;
        const varname = meta.form.setVar ? `${meta.form.setVar} = ` : "";
        const query = meta.form.query;
        const auth = meta.form.auth;
        const payload = meta.form.payload;
        const result = {
          source: ` ${varname} await query(\`${query}\`, {
                   ${payload ? `payload: ${payload},` : ""}
                   ${auth ? `auth: "${auth}",` : ""}
                });
            `,
          imports: {
            ...meta.form.imports,
            query: {
              from: "@src/libs/utils/gql",
              type: "named"
            }
          }
        };
        if (meta.resolve) {
          meta.resolve(result);
        }
      }}
      minHeightContent={600}
      width={"90%"}
    >
      <div className="cactiva-dialog-editor">
        <HasuraForm form={meta.form} gref={gref} />
      </div>
    </Dialog>
  );
};

export const promptHasura = (data?: {
  query: string;
  payload: string;
  auth: any;
  setVar: string;
}) => {
  editor.modals.hasura = true;
  meta.lastForm = meta.form;
  if (data) {
    _.set(meta, "form.query", data.query);
    _.set(meta, "form.payload", data.payload);
    _.set(meta, "form.auth", data.auth);
    _.set(meta, "form.setVar", data.setVar);
  } else {
    meta.form = _.cloneDeep(form);
  }

  return new Promise(resolve => {
    meta.resolve = resolve;
  });
};

const graphQLFetcher = async (params: any) => {
  if (_.get(params, 'operationName') === 'IntrospectionQuery') {
    if (localStorage['cactiva-hasura-schema']) {
      const res = JSON.parse(localStorage['cactiva-hasura-schema']);
      meta.schema = buildClientSchema(res);
      meta.schemaLoading = false;
      return res;
    }
  }
  const res = await api.post("project/gql-query", {
    body: params
  });
  if (res.data.__schema) {
    meta.schema = buildClientSchema(res.data);
    meta.schemaLoading = false;
  }

  if (_.get(params, 'operationName') === 'IntrospectionQuery') {
    localStorage['cactiva-hasura-schema-params'] = JSON.stringify(params);
    localStorage['cactiva-hasura-schema'] = JSON.stringify(res.data);
  }

  return res.data;
};

const HasuraForm = observer(({ form, gref }: any) => {
  return (
    <div className="rest-api-form">
      {meta.schemaLoading && (
        <div className="loading">
          <Spinner />
          Loading Schema
        </div>
      )}
      <div className="gql">
        <div className="graphiql-container">
          <GraphiQLExplorer
            schema={meta.schema}
            explorerIsOpen={meta.explorerIsOpen}
            query={meta.form.query}
            onEdit={(e: any) => {
              meta.form.query = e;
            }}
            onRunOperation={(operationName: any) =>
              gref.current.handleRunQuery(operationName)
            }
          />
          <GraphiQL
            fetcher={graphQLFetcher}
            query={meta.form.query}
            onEditQuery={(e: any) => {
              meta.form.query = e;
            }}
            variables={meta.form.payload}
            onEditVariables={(e: any) => {
              meta.form.payload = e;
            }}
            schema={meta.schema}
            ref={gref}
          >
            <GraphiQL.Toolbar>
              <GraphiQL.Button
                onClick={() => gref.current.handlePrettifyQuery()}
                label="Prettify"
                title="Prettify Query (Shift-Ctrl-P)"
              />
              <GraphiQL.Button
                onClick={() => gref.current.handleToggleHistory()}
                label="History"
                title="Show History"
              />
              <GraphiQL.Button
                onClick={() => (meta.explorerIsOpen = !meta.explorerIsOpen)}
                label="Explorer"
                title="Show Explorer"
              />
              <GraphiQL.Button
                onClick={async () => {
                  const res = await promptExpression({
                    value: form.setVar,
                    local: true
                  });
                  form.setVar = res.expression;
                  form.imports = res.imports;
                }}
                title={`Set Result To: ${
                  form.setVar === "" ? "[Empty Variable]" : form.setVar
                  }`}
                label={`Set Result To: ${
                  form.setVar === "" ? "[Empty Variable]" : form.setVar
                  }`}
              />
              <GraphiQL.Select>
                <GraphiQL.SelectOption
                  label={"Auth: Logged In"}
                  selected={meta.form.auth == "login"}
                  onSelect={(e: any) => {
                    meta.form.auth = "login";
                  }}
                />
                <GraphiQL.SelectOption
                  label={"Auth: Guest"}
                  selected={meta.form.auth == "guest"}
                  onSelect={(e: any) => {
                    meta.form.auth = "guest";
                  }}
                />
              </GraphiQL.Select>
              <GraphiQL.Button
                onClick={() => {
                  meta.schemaLoading = true;
                  localStorage['cactiva-hasura-schema'] = '';
                  graphQLFetcher(JSON.parse(localStorage['cactiva-hasura-schema-params']));
                }}
                label="↻"
                title="Reload Schema"
              />
            </GraphiQL.Toolbar>
          </GraphiQL>
        </div>
      </div>
    </div>
  );
});
