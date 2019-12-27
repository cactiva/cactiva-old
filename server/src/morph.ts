import * as _ from "lodash";
import * as path from "path";
import * as fs from "fs";
import { ImportDeclarationStructure, Project as TProject, SourceFile, SyntaxKind, StructureKind, Node, ObjectLiteralExpression } from "ts-morph";
import { execPath } from "./config";
import { cleanHooks } from "./libs/morph/cleanHooks";
import { defaultExport, defaultExportShallow } from "./libs/morph/defaultExport";
import { generateSource } from "./libs/morph/generateSource";
import { getHooks } from "./libs/morph/getHooks";
import { getImports } from "./libs/morph/getImport";
import { getEntryPoint, parseJsx } from "./libs/morph/parseJsx";
import { replaceReturn } from "./libs/morph/replaceReturn";
import jetpack = require("fs-jetpack");

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
      try {
        this.reload();
        return this.project.getSourceFileOrThrow(item => {
          const itemName = (!isAbsolutePath ? this.getAppPath() : "") + name;
          return item.getFilePath() === itemName;
        });
      } catch (e) {
        return null;
      }
    }
  }

  randomDigits() {
    return Math.random()
      .toString()
      .slice(2, 11);
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

  async readTsx(filename: string, showKindName = false) {
    const sf = this.getSourceFile(filename);
    if (sf) {
      await sf.refreshFromFileSystem();
      const result = await this.formatCactivaSource(sf, showKindName);
      await sf.refreshFromFileSystem();
      return result;
    } return null;
  }

  async formatCactivaSource(sf: SourceFile, showKindName = false) {
    const de = defaultExport(sf);
    const ps = parseJsx(getEntryPoint(de), showKindName);
    return {
      file: await replaceReturn(sf, "<<<<cactiva>>>>"),
      imports: getImports(sf),
      hooks: getHooks(sf),
      component: ps
    };
  }

  reload() {
    process.chdir(this.getAppPath());
    this.project.addSourceFilesFromTsConfig(path.join(".", "tsconfig.json"));
  }


  processImports(sf: SourceFile, postedImports: any) {
    const currentImports = getImports(sf)
    for (let i in postedImports) {
      if (!currentImports[i]) {
        const im = postedImports[i];
        currentImports[i] = im;
        const imstruct: ImportDeclarationStructure = {
          kind: StructureKind.ImportDeclaration,
          moduleSpecifier: im.from
        };
        if (im.type === "default") {
          imstruct.defaultImport = i;
        } else {
          imstruct.namedImports = [i];
        }
        sf.addImportDeclaration(imstruct);
      }
    }
  }

  processHooks(sf: SourceFile, postedHooks: any) {
    cleanHooks(sf);
    const de = defaultExportShallow(sf);
    const dp = de.getParent();
    const hookSource = postedHooks
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

  public getTree() {
    const tree: any = jetpack.inspectTree(
      path.join(this.getAppPath(), "src"),
      {
        relativePath: true
      }
    );

    const exclude = [
      "./assets",
      "./libs",
      "./config",
      "./stores",
      "./api",
      "./.DS_",
      "./components.ts",
      "./fonts.ts",
      "./theme.json"
    ];
    tree.children = tree.children.filter((e: any) => {
      for (let ex of exclude) {
        if (e.relativePath.indexOf(ex) === 0) return false;
      }
      return true;
    });
    return tree;
  }
  public async reloadComponentDefinitions() {
    const sf = this.getSourceFile("/src/components.ts");
    if (sf) {
      sf.forEachChild((child: any) => {
        if (child.getKindName() === "ExportAssignment") {
          const flatten = (obj: any[], prev = "") => {
            const res: any[] = [];
            obj.forEach((e: any) => {
              res.push({ ...e, name: prev + e.name, children: null });
              if (e.children) {
                flatten(e.children, prev + e.name + "/").map(f => {
                  res.push(f);
                })
              }
            });
            return res;
          }
          const tree = this.getTree();
          const components: string[] = flatten(tree.children);
          child.getExpression().replaceWithText(`{
\t${components.map((e: any) => {
            return `"${e.name}":require("./${e.name}").default`;
          }).join(',\n\t')}
 }`);
        }
      });

      await sf.save()
    }
  }

  async getTypes() {
    const typesPath = `${execPath}/app/${this.name}/`;
    const memory = await this.project.emitToMemory({ emitOnlyDtsFiles: true });
    const result = {} as any;
    memory.getFiles().map((item) => {
      result['@' + item.filePath.substr(typesPath.length)] = item.text;
    })
    return result;
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
          tsConfigFilePath: path.join(".", "tsconfig.json"),
          // compilerOptions: { outDir: "types", declaration: true }
        });
        Morph.instances[name].reloadComponentDefinitions();
        Morph.lastName = name;
      } else {
        delete Morph.instances[name];
        console.log(`Project with name ${name} not found`);
      }
    }

    return Morph.instances[name];
  }
}
