
export interface ICactivaProp {}
export abstract class CactivaTag {
  static tagName: string = '';
  static from: string = '';
  static traits: { [key: string]: ICactivaProp } = {};
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
