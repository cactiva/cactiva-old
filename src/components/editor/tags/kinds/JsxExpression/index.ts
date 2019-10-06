import { CactivaKind } from '@src/components/editor/utility/kinds';

export default class extends CactivaKind {
  static kindName = 'JsxExpression';
  static element = require('./element').default;
}
