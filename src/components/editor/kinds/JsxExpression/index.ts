import { CactivaKind } from '@src/components/editor/utility/tags';

export default class extends CactivaKind {
  static kindName = 'JsxExpression';
  static element = require('./element').default;
}
