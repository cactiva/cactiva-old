import _ from 'lodash';
import { SyntaxKind } from './syntaxkinds';
export const isTag = (s: any, tagName?: string): boolean => {
  let tag: any = false;

  const kind = _.get(s, 'kind');
  if (kind === SyntaxKind.JsxElement) {
    tag = true;
  } else if (kind === SyntaxKind.JsxSelfClosingElement) {
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
