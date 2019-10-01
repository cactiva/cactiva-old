export interface ICactivaTraitField {
  label?: string;
  name: string;
  kind: number;
  default?: any;
  options?: any;
}
export interface ICactivaTrait {
  name: string;
  fields: ICactivaTraitField[];
}

export abstract class CactivaTag {
  static tagName: string = '';
  static from: string = '';
  static traits: ICactivaTrait[] = [];
  static element: any;
}

const r = require.context('../tags/', true, /.*\/index.ts$/, 'sync');
export const allTags: string[] = [];
const tags: {
  [key: string]: CactivaTag;
} = {};

r.keys().forEach(key => {
  let name = key.substr(2);
  name = name.substr(0, name.length - 9);

  if (!!name) {
    tags[name] = r(key).default;
    allTags.push(name);
  }
});
export default tags;
