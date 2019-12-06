import { promptExpression } from './ExpressionSinglePopup';

export const promptCode = async (value?: string, language = "javascript") => {
    return (await promptExpression({
        value,
        language
    })).expression
}