import * as path from "path";
import { Project as TProject, SourceFile, SyntaxKind } from "ts-morph";
import { execPath } from "./config";
import { cleanImports } from "./libs/morph/cleanImports";
import {
  defaultExport,
  defaultExportShallow
} from "./libs/morph/defaultExport";
import { getHooks } from "./libs/morph/getHooks";
import { getImport } from "./libs/morph/getImport";
import { getEntryPoint, parseJsx } from "./libs/morph/parseJsx";
import { replaceReturn } from "./libs/morph/replaceReturn";
import jetpack = require("fs-jetpack");
import { generateSource } from "./libs/morph/generateSource";
import { cleanHooks } from "./libs/morph/cleanHooks";
import * as _ from "lodash";

export class Morph {
  project: TProject = new TProject();
  name: string;

  getAppPath() {
    return `${execPath}/app/${this.name}`;
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
    try {
      return this.project.getSourceFileOrThrow(item => {
        const itemName = (!isAbsolutePath ? this.getAppPath() : "") + name;
        return item.getFilePath() === itemName;
      });
    } catch (e) {
      this.reload();
      return this.project.getSourceFileOrThrow(item => {
        const itemName = (!isAbsolutePath ? this.getAppPath() : "") + name;
        console.log(itemName, item.getFilePath());
        return item.getFilePath() === itemName;
      });
    }
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
      cleanImports(sf, imports);
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

  createTempSource(source: string, callback: any) {
    const sf = this.project.createSourceFile("__tempfile__.tsx", source);
    let result = null as any;
    try {
      callback(sf);
    } catch (e) {
      console.log(e);
    } finally {
      sf.forget();
      sf.deleteImmediately();
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
      hooks: getHooks(sf),
      component: ps
    };
  }

  reload() {
    process.chdir(this.getAppPath());
    this.project.addSourceFilesFromTsConfig(path.join(".", "tsconfig.json"));
  }

  processHooks(sf: SourceFile, postedHooks: any) {
    const hooks: any = [];
    const sourceHooks = getHooks(sf);

    const findExisting = (item: any) => {
      for (let i in hooks) {
        const hook = hooks[i];
        if (item.kind === hook.kind && item.name === hook.name) {
          return {
            value: hook,
            key: i
          };
        }
      }
      return false;
    };

    const process = (item: any, key: number) => {
      if (!item) return;
      const existing = findExisting(item);
      if (!existing) {
        hooks.push(item);
      }
    };

    // (sourceHooks || []).map(process);
    (postedHooks || []).map(process);

    cleanHooks(sf);
    const de = defaultExportShallow(sf);
    const dp = de.getParent();
    const hookSource = hooks
      .map((hook: any, index: number) => {
        const body = generateSource(hook);
        if (typeof body !== "string") {
          console.log("generateSource: kind not found!!! - in processHooks()");
          return "";
        }
        return body;
      })
      .join("\n");
    dp.setBodyText(`\n${hookSource}\n\n` + _.trim(de.getText().trim(), "{}"));
  }

  /************************ Singleton  **************************/
  public static instances: { [key: string]: Morph } = {};
  constructor(name: string) {
    if (Morph.instances[name]) {
      throw new Error("Use Morph.getInstance('" + name + "') instead of new");
    }
    this.name = name;
  }

  public static lastName = "";
  public static getInstance(name: string): Morph {
    if (name === undefined) {
      name = Morph.lastName;
    }

    if (!Morph.instances[name]) {
      Morph.instances[name] = new Morph(name);
      if (jetpack.exists(`${execPath}/app/${name}`)) {
        process.chdir(`${execPath}/app/${name}`);
        console.log(`Project loaded: ${execPath}/app/${name}`);
        Morph.instances[name].project = new TProject({
          tsConfigFilePath: path.join(".", "tsconfig.json")
        });
        Morph.lastName = name;
      } else {
        delete Morph.instances[name];
        throw new Error(`Project with name ${name} not found`);
      }
    }

    return Morph.instances[name];
  }
}
