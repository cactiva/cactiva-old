import { promptExpression } from '@src/components/editor/CactivaExpressionDialog';
import api from '@src/libs/api';
import editor from '@src/store/editor';
import { Dialog } from 'evergreen-ui';
import GraphiQL from 'graphiql';
import GraphiQLExplorer from "graphiql-explorer";
import "graphiql/graphiql.css";
import { buildClientSchema } from "graphql";
import _ from "lodash";
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { default as React, useRef } from 'react';
import "./Hasura.scss";
const form = {
    setVar: "",
    headers: {},
    imports: [] as any
};
const meta = observable({
    language: "javascript",
    form: _.cloneDeep(form),
    explorerIsOpen: true,
    query: '',
    schema: undefined as any,
    lastForm: null as any,
    auth: 'login',
    resolve: null as any
})
export default () => {
    const gref = useRef(null as any);

    return <Dialog
        isShown={true}
        hasHeader={false}
        hasFooter={false}
        preventBodyScrolling
        shouldCloseOnEscapePress={false}
        onCloseComplete={() => {
            editor.modals.hasura = false;
            const varname = meta.form.setVar ? `${meta.form.setVar} = ` : '';
            const header = meta.form.headers;
            const query = meta.query;
            const payload = gref.current._storage.storage['graphiql:variables'];
            const result = {
                source: ` ${varname} await query('${query}', ${payload}, {
                   ${header ? `headers: ${header}` : ''}
                });
            `, imports: {
                    ...meta.form.imports,
                    query: {
                        from: "@src/libs/gql",
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
    </Dialog>;
}

export const promptHasura = () => {
    editor.modals.hasura = true;
    meta.lastForm = meta.form;

    meta.form = _.cloneDeep(form);
    return new Promise(resolve => {
        meta.resolve = resolve;
    });
}

const graphQLFetcher = async (params: any) => {
    const form = meta.form;
    const res = await api.post("project/gql-query", {
        body: params,
        headers: form.headers
    })
    if (res.data.__schema) {
        meta.schema = buildClientSchema(res.data);
    }

    return res.data;
}

const HasuraForm = observer(({ form, gref }: any) => {
    return <div className="rest-api-form">
        <div className="gql">
            <div className="graphiql-container">
                <GraphiQLExplorer
                    schema={meta.schema}
                    explorerIsOpen={meta.explorerIsOpen}
                    query={meta.query}
                    onEdit={(e: any) => {
                        meta.query = e;
                    }}
                    onRunOperation={(operationName: any) =>
                        gref.current.handleRunQuery(operationName)
                    }
                />
                <GraphiQL
                    fetcher={graphQLFetcher}
                    query={meta.query}
                    onEditQuery={(e: any) => {
                        meta.query = e;
                    }}
                    schema={meta.schema}
                    ref={gref}>
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
                            onClick={() => meta.explorerIsOpen = !meta.explorerIsOpen}
                            label="Explorer"
                            title="Show Explorer"
                        />
                        <GraphiQL.Button
                            onClick={async () => {
                                const res = (await promptExpression({
                                    value: form.setVar
                                }));
                                form.setVar = res.expression;
                                form.imports = res.imports;
                            }}
                            title={`Set Result To: ${form.setVar === "" ? "[Empty Variable]" : form.setVar}`}
                            label={`Set Result To: ${form.setVar === "" ? "[Empty Variable]" : form.setVar}`}
                        />
                        <GraphiQL.Select>
                            <GraphiQL.SelectOption label={"Auth: Logged In"}
                                selected={meta.auth == "login"}
                                onSelect={(e: any) => {
                                    meta.auth = "login"
                                }} />
                            <GraphiQL.SelectOption label={"Auth: Guest"}
                                selected={meta.auth == "guest"}
                                onSelect={(e: any) => {
                                    meta.auth = "guest"
                                }} />
                        </GraphiQL.Select>
                    </GraphiQL.Toolbar>
                </GraphiQL>
            </div>
        </div>
    </div>
})

