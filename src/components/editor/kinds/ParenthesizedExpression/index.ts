import { CactivaKind } from '@src/components/editor/utility/tags';

export default class extends CactivaKind {
  static kindName = 'ParenthesizedExpression';
  static element = require('./element').default;
}
