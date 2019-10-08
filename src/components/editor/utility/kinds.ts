import { SyntaxKind } from "./syntaxkinds";
import { CactivaKind } from "./classes";

export const kindNames: { [key: number]: string } = {};

for (let k in SyntaxKind) {
  if (!kindNames[parseInt(SyntaxKind[k])])
    kindNames[parseInt(SyntaxKind[k])] = k;
}

const r = require.context("../tags/kinds/", true, /.*\/index.ts$/, "sync");
export const allKinds: string[] = [];
const kinds: {
  [key: string]: CactivaKind;
} = {};

r.keys().forEach(key => {
  const element = r(key).default;
  const name = element.kindName;
  kinds[name] = element;
  allKinds.push(name);
});
export default kinds;
