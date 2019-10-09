import _ from 'lodash';
import { SyntaxKind } from './syntaxkinds';
export const isTag = (s: any, tagName?: string): boolean => {
  let result = false;

  const kind = _.get(s, 'kind');
  if (kind === SyntaxKind.JsxElement) {
    result = true;
  } else if (kind === SyntaxKind.JsxSelfClosingElement) {
    result = true;
  }

  if (tagName !== undefined) {
    if (s && s.name === tagName) {
      return true;
    }
    return false;
  }

  return result;
};
