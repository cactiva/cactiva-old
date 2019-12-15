import _ from "lodash";
import { SyntaxKind } from "../syntaxkinds";
import tags from "../tags";
import { ITable } from "./genQueryString";

export const generateCrudTable = (query: { table: ITable, var: string }) => {
    const Table = tags['Table'] as any;
    const struct = _.cloneDeep(Table.structure);
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
    const struct = _.cloneDeep(Form.structure);
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
            children: [_.cloneDeep((tags['Input'] as any).structure)]
        })
    })
    _.set(struct, "children", fields);
    return {
        "kind": 271,
        "value": {
            "kind": 198,
            "params": [
                "mode: \"create\" | \"update\" | \"filter\""
            ],
            "body": [
                {
                    "kind": 231,
                    "value": struct
                }
            ]
        }
    };
}


export const generateCrudActions = (query: { table: ITable, var: string }) => {
    const View = tags['View'] as any;
    const Button = tags['Button'] as any;
    const struct = _.cloneDeep(View.structure);
    const createButton = (title: string, type: string) => {
        const btn = _.cloneDeep(Button.structure);
        btn.props.type = {
            "kind": 10,
            "value": `"${type}"`
        };
        return {
            ...btn,
            children: [{
                ...btn.children[0],
                children: [{ kind: SyntaxKind.StringLiteral, value: title }]
            }]
        }
    }

    struct.props["style"] = {
        "kind": 189,
        "value": {
            "flexDirection": {
                "kind": 10,
                "value": "\"row\""
            }
        }
    };

    struct.children = [
        createButton("Create", "create"),
        createButton("Delete", "delete"),
        createButton("Save", "save"),
        createButton("Cancel", "cancel")
    ];
    return struct;
}


export const generateCrudTitle = (query: { table: ITable, var: string }) => {
    const Text = tags['Text'] as any;
    const struct = _.cloneDeep(Text.structure);
    const title = query.table.name.split("_")
    title.shift();

    struct.children = [{ kind: SyntaxKind.StringLiteral, value: _.startCase(title.join("_")) }]
    return struct;
}