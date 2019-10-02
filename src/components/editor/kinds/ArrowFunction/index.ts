import { CactivaKind } from '@src/components/editor/utility/tags';

export default class extends CactivaKind {
  static kindName = 'ArrowFunction';
  static element = require('./element').default;
}
