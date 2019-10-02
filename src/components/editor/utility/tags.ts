export interface ICactivaTraitField {
  label?: string;
  name: string;
  path: string;
  kind: number;
  default?: any;
  options?: {
    styles?: {
      root?: any;
      label?: any;
      field?: any;
    };
  } & any;
}
export interface ICactivaTrait {
  name: string;
  kind?: number;
  default?: any;
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
  const element = r(key).default;
  const name = element.tagName;
  tags[name] = element;
  allTags.push(name);
});
export default tags;
