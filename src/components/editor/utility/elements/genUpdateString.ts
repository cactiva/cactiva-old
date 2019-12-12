import { ITable, genFields, genWhere, ITableWhere } from "./genQueryString";
import _ from 'lodash';

export const generateUpdateString = (table: ITable, data: any, options: {
    where: ITableWhere[],
    returnData?: boolean
}): { query: string, variable: any } => {

    const where = genWhere(options.where) || `where: {}`;
    return {
        query: `mutation Update($data:${table.name}_set_input) {
    update_${table.name}(_set: $data, ${where}) {
        affected_rows
        ${_.get(options, 'returnData', true) ? `returning {
${genFields(table, { showArgs: false, withFirstTable: false }, 2)}
        }` : ''}
    }  
}`,
        variable: {
            data
        }
    };
}