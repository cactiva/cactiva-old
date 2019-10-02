const r = require.context('./kinds/', true, /.*\.tsx/, 'sync');
export const allTags: string[] = [];
const tags: {
  [key: string]: any;
} = {};
r.keys().forEach(key => {
  let name = key.substr(2);
  name = name.substr(0, name.length - 4);

  if (!!name) {
    tags[name] = r(key).default;
  }
});
export default tags;
