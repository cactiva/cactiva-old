import { CactivaTag } from '@src/components/editor/utility/tags';

export default class extends CactivaTag {
  static tagName = 'Icon';
  static from = '@src/libs';
  static traits = [];
  static element = require('./element').default;
}
