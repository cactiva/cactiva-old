export interface ICactivaTraitField {
  label?: string;
  name: string;
  path: string;
  kind: number;
  default?: any;
  mode?: string;
  options?: {
    styles?: {
      root?: any;
      label?: any;
      field?: any;
    };
    items?: { label: string; value: string | number }[];
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
  static structure: any;
}

const r = require.context('../tags/', true, /.*\/index.ts$/, 'sync');
export const allTags: string[] = [];
const tags: {
  [key: string]: CactivaTag;
} = {};

r.keys().forEach(key => {
  const element = r(key).default;
  const name = element.tagName;
  if (key.indexOf('kinds/')) {
    tags[name] = element;
    allTags.push(name);
  }
});
export default tags;
