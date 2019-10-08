import { CactivaTag } from "./classes";

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
