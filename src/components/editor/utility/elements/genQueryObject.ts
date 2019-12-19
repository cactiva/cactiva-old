import { promptHasura } from "@src/components/traits/expression/Hasura";
import gql from "graphql-tag";
import _ from 'lodash';
import { ITable, ITableWhere, ITableOrderBy } from "./genQueryString";

export const generateQueryObject = async (input?: any) => {
    let res: any = null;

    if (!input) {
        res = await promptHasura(undefined, {
            mustSetVar: true,
            returnQueryOnly: true
        })
    } else {
        res = input;
    }

    let struct = {} as any;
    try {
        struct = gql`${res.query}`;
    } catch (e) {
        console.log(e);
        return null;
    }

    const root = _.get(struct, 'definitions.0.selectionSet.selections.0');
    const table = parseTable(root);
    return { table, var: res.setVar, auth: res.auth }
}

export const parseTable = (table: any): ITable => {
    const name = _.get(table, 'name.value');
    const fields = _.get(table, 'selectionSet.selections', []).map(
        (e: any) => {
            if (!!_.get(e, 'selectionSet')) {
                let childTable = parseTable(e);
                return childTable;
            }
            return { name: _.get(e, 'name.value') }
        }
    );

    const where = [] as ITableWhere[];
    const orderBy = [] as ITableOrderBy[];
    const options = {} as any;

    const parseWhere = (e: any) => {
        return _.get(e, 'value.fields').map((w: any) => {
            const item = {
                name: _.get(w, 'name.value'),
                operator: _.get(w, 'value.fields.0.name.value'),
                valueType: _.get(w, 'value.fields.0.value.kind'),
                value: _.get(w, 'value.fields.0.value.value')
            }
            if (item.valueType === 'ObjectValue') {
                item.value = parseWhere(w);
            }
            return item;
        })
    }
    const parseOrderBy = (e: any) => {
        return _.get(e, 'value.fields').map((w: any) => {
            const item = {
                name: _.get(w, 'name.value'),
                value: _.get(w, 'value.value'),
                valueType: _.get(w, 'value.kind'),
            }
            if (item.valueType === 'ObjectValue') {
                item.value = parseOrderBy(w);
            }
            return item;
        })
    }

    _.get(table, 'arguments', []).map((e: any) => {
        const argType = _.get(e, 'name.value');
        if (argType === 'where') {
            parseWhere(e).map((w: any) => where.push(w));
        } else if (argType === 'order_by') {
            parseOrderBy(e).map((w: any) => orderBy.push(w));
        } else if (argType === 'limit') {
            options.limit = _.get(e, 'value.value')
        } else if (argType === 'offset') {
            options.offset = _.get(e, 'value.value')
        } else if (argType === 'distinct_on') {
            options.distinct_on = _.get(e, 'value.value')
        }
    })

    return {
        name,
        fields,
        where,
        orderBy,
        options
    }
}

