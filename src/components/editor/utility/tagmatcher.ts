import { SyntaxKind } from './kinds';

export const isTag = (s: any, tagName?: string): boolean => {
  let tag: any = false;

  if (s.kind === SyntaxKind.JsxElement) {
    tag = true;
  } else if (s.kind === SyntaxKind.JsxSelfClosingElement) {
    tag = true;
  }

  if (tagName !== undefined) {
    if (tag && tag.name === tagName) {
      return true;
    }
    return false;
  }

  return tag;
};
