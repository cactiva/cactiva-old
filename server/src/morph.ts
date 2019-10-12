import * as path from "path";
import { Project as TProject, SyntaxKind } from "ts-morph";
import config, { execPath } from "./config";
import { defaultExport } from "./libs/morph/defaultExport";
import { parseJsx, getEntryPoint } from "./libs/morph/parseJsx";
import * as _ from "lodash";
import { kindNames } from "./libs/morph/kindNames";
import { replaceReturn } from "./libs/morph/replaceReturn";

export class Morph {
  project: TProject = new TProject();

  getAppPath() {
    return `${execPath}/app/${config.get("app")}`;
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
    const de = defaultExport(sf);
    const ps = parseJsx(getEntryPoint(de), showKindName);
    return {
      file: replaceReturn(sf, "<<<<cactiva>>>>"),
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
