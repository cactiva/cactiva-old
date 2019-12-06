import { promptExpression } from './ExpressionSinglePopup';

export const promptCode = async (value?: string, language = "javascript") => {
    const res = await promptExpression({
        value,
        language,
        lineNumbers: "on",
        size: {
            w: 800,
            h: 400
        }
    });

    if (res.changed) {
        return res.expression
    }
    return null;
}