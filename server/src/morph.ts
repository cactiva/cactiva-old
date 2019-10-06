import * as path from 'path';
import { Project as TProject } from 'ts-morph';
import config, { execPath } from './config';
import { defaultExport } from './libs/morph/defaultExport';
import { generateJsx } from './libs/morph/generateJsx';
import { parseJsx } from './libs/morph/parseJsx';

export class Morph {
  private root: TProject = new TProject();

  getAppPath() {
    return `${execPath}/app/${config.get('app')}`;
  }

  parseText(source: string) {
    const sf = this.root.createSourceFile('__tempfile__.ts', source);
    try {
      return parseJsx(sf.getFirstChild());
    } finally {
      sf.delete();
    }
  }

  getSourceFile(filename: string) {
    return this.root.getSourceFileOrThrow(file => {
      return file.getFilePath() === this.getAppPath() + filename;
    });
  }

  readTsx(filename: string, showKindName = false) {
    const sf = this.getSourceFile(filename);
    const de = defaultExport(sf);
    const ps = parseJsx(de, showKindName);
    return ps;
  }

  writeTsx(node: any) {
    return generateJsx(node);
  }

  /************************ Singleton  **************************/
  private static instance: Morph;

  constructor() {
    if (Morph.instance) {
      throw new Error('Use Singleton.getInstance() instead of new');
    }
  }

  public static getInstance(): Morph {
    if (!Morph.instance) {
      Morph.instance = new Morph();
    }

    process.chdir(Morph.instance.getAppPath());
    console.log(`Project loaded: ${Morph.instance.getAppPath()}`);
    Morph.instance.root = new TProject({
      tsConfigFilePath: path.join('.', 'tsconfig.json')
    });
    return Morph.instance;
  }
}
