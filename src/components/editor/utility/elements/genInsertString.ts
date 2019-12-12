import { ITable, genFields } from "./genQueryString";
import _ from 'lodash'; 

export const generateInsertString = (table: ITable, data: any, options?: {
    returnData?: boolean
}): { query: string, variable: any } => {
    return {
        query: `mutation Insert($data:${table.name}_set_input) {
    insert_${table.name}(objects: $data) {
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