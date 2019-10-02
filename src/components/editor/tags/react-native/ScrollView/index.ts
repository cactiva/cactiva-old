import { CactivaTag } from '@src/components/editor/utility/tags';
import styleTrait from '@src/components/traits/templates/styleTrait';

const styles = {
  root: {
    flex: "1 1 100%"
  }
};

export default class extends CactivaTag {
  static tagName = 'ScrollView';
  static from = 'react-native';
  static traits = [
    {
      name: 'attributes',
      fields: []
    },
    ...styleTrait
  ];
  static element = require('./element').default;
}
