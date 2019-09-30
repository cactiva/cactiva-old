import { SyntaxKind } from './syntaxkind';

export const findTag = (s: any, tagName?: string): any => {
  let tag: any = undefined;

  if (s.kind === SyntaxKind.JsxElement) {
    tag = s;
  } else if (s.kind === SyntaxKind.JsxSelfClosingElement) {
    tag = s;
  } else if (s.kind === SyntaxKind.ParenthesizedExpression) {
    tag = findTag(s.value, tagName);
  }

  if (tagName !== undefined) {
    if (tag && tag.name === tagName) {
      return tag;
    }
    return undefined;
  }

  return tag;
};
