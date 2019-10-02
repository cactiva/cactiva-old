import { CactivaTag } from '@src/components/editor/utility/tags';

export default class extends CactivaTag {
  static tagName = 'Image';
  static from = 'react-native';
  static traits = [];
  static element = require('./element').default;
}
