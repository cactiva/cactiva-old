import _ from "lodash";
import { SyntaxKind } from "../syntaxkinds";
import tags from "../tags";
import { ITable } from "./genQueryString";

export const generateCrudTable = (query: { table: ITable, var: string }) => {
    const Table = tags['Table'] as any;
    const struct = _.clone(Table.structure);
    struct.props.columnMode = {
        "kind": 10,
        "value": `"manual"`
    };
    const columnsHead: any[] = []
    const columnsRow: any[] = []
    _.map(query.table.fields, (f) => {
        columnsHead.push({
            kind: SyntaxKind.JsxElement,
            name: "TableColumn",
            props: {
                title: {
                    "kind": 10,
                    "value": `"${_.startCase(f.name)}"`
                }
            },
            children: []
        })
        columnsRow.push({
            kind: SyntaxKind.JsxElement,
            name: "TableColumn",
            props: {
                path: {
                    "kind": 10,
                    "value": `"${f.name}"`
                },
            },
            children: []
        })
    })
    _.set(struct, "children.0.children", columnsHead);
    _.set(struct, "children.1.children", columnsRow);
    return struct;
}

export const generateCrudForm = (query: { table: ITable, var: string }) => {
    const Form = tags['Form'] as any;
    const struct = _.clone(Form.structure);
    struct.props.data = {
        "kind": 271,
        "value": {
            "kind": 73,
            "value": query.var
        }
    };
    const fields: any[] = [];
    _.map(query.table.fields, (f) => {
        fields.push({
            kind: SyntaxKind.JsxElement,
            name: "Field",
            props: {
                label: {
                    "kind": 10,
                    "value": `"${_.startCase(f.name)}"`
                },
                path: {
                    "kind": 10,
                    "value": `"${f.name}"`
                }
            },
            children: [_.clone((tags['Input'] as any).structure)]
        })
    })
    _.set(struct, "children", fields);
    return struct;
}