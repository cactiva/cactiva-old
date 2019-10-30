import * as path from "path";
import { Project as TProject, SyntaxKind } from "ts-morph";
import config, { execPath } from "./config";
import { defaultExport } from "./libs/morph/defaultExport";
import { parseJsx, getEntryPoint } from "./libs/morph/parseJsx";
import * as _ from "lodash";
import { kindNames } from "./libs/morph/kindNames";
import { replaceReturn } from "./libs/morph/replaceReturn";
import { getImport } from "./libs/morph/getImport";
import { removeImports } from "./libs/morph/removeImports";

export class Morph {
  project: TProject = new TProject();

  getAppPath() {
    return `${execPath}/app/${config.get("app")}`;
  }
  parseExpression(source: string) {
    const sf = this.project.createSourceFile(
      "__tempfile" + this.randomDigits() + "__.tsx",
      `${source}`
    );
    let result = null as any;
    try {
      const fc = getEntryPoint(sf.getFirstChild()) as any;
      result = parseJsx(fc);
    } finally {
      sf.forget();
    }
    return result;
  }
  parseJsxExpression(source: string) {
    // const sourced = `<div>${source}</div>`;

    const sf = this.project.createSourceFile(
      "__tempfile" + this.randomDigits() + "__.tsx",
      `<div>${source}</div>`
    );
    let result = null as any;
    try {
      const fc = getEntryPoint(sf.getFirstChild()) as any;
      result = parseJsx(fc).children[0];
    } finally {
      sf.forget();
    }
    return result;
  }

  getDirectory(name: string, isAbsolutePath = false) {
    return this.project.getDirectoryOrThrow(name);
  }

  getSourceFile(name: string, isAbsolutePath = false) {
    return this.project.getSourceFileOrThrow(item => {
      const itemName = (!isAbsolutePath ? this.getAppPath() : "") + name;
      return item.getFilePath() === itemName;
    });
  }

  randomDigits() {
    return Math.random()
      .toString()
      .slice(2, 11);
  }
  prepareSourceForWrite(source: string, imports: any[]) {
    const sf = this.project.createSourceFile(
      "__tempfile" + this.randomDigits() + "__.tsx",
      source
    );
    let result = "";
    try {
      removeImports(sf);
      result = sf.getText();
      const imresult: any = {};
      Object.keys(imports).map((i: any) => {
        const im = imports[i];
        if (!imresult[im.from]) {
          imresult[im.from] = {
            default: null,
            named: []
          };
        }

        if (im.type === "default") {
          imresult[im.from].default = i;
        } else {
          imresult[im.from].named.push(i);
        }
      });
      const importText: string[] = [];
      Object.keys(imresult).map((i: any) => {
        const v = imresult[i];
        const from = i;
        const imtext = [];
        if (v.default) {
          imtext.push(v.default);
        }
        if (v.named.length > 0) {
          imtext.push(`{ ${v.named.join(",")} }`);
        }
        importText.push(`import ${imtext.join(",")} from "${from}";`);
      });
      result = importText.join("\n") + "\n\n" + result;
    } catch (e) {
      console.log(e);
    } finally {
      sf.forget();
    }

    return result;
  }
  parseSource(source: string, showKindName = false) {
    const sf = this.project.createSourceFile(
      "__tempfile" + this.randomDigits() + "__.tsx",
      source
    );
    let result = null as any;
    try {
      const de = defaultExport(sf);
      const ps = parseJsx(getEntryPoint(de), showKindName);
      result = {
        file: replaceReturn(sf, "<<<<cactiva>>>>"),
        component: ps
      };
    } catch (e) {
      console.log(e);
    } finally {
      sf.forget();
    }

    return result;
  }
  readTsx(filename: string, showKindName = false) {
    const sf = this.getSourceFile(filename);
    sf.refreshFromFileSystemSync();
    const de = defaultExport(sf);
    const ps = parseJsx(getEntryPoint(de), showKindName);
    return {
      file: replaceReturn(sf, "<<<<cactiva>>>>"),
      imports: getImport(sf),
      component: ps
    };
  }

  reload() {
    process.chdir(this.getAppPath());
    this.project.addSourceFilesFromTsConfig(path.join(".", "tsconfig.json"));
  }

  /************************ Singleton  **************************/
  private static instance: Morph;

  constructor() {
    if (Morph.instance) {
      throw new Error("Use Singleton.getInstance() instead of new");
    }
  }

  public static getInstance(): Morph {
    if (!Morph.instance) {
      Morph.instance = new Morph();
      process.chdir(Morph.instance.getAppPath());
      console.log(`Project loaded: ${Morph.instance.getAppPath()}`);
      Morph.instance.project = new TProject({
        tsConfigFilePath: path.join(".", "tsconfig.json")
      });
    }

    return Morph.instance;
  }
}
