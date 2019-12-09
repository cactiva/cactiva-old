import { addChildInId, commitChanges, findElementById, insertAfterElementId, prepareChanges, removeElementById } from "@src/components/editor/utility/elements/tools";
import api from "@src/libs/api";
import _ from "lodash";
import { computed, observable, toJS } from "mobx";
import { SourceStore } from "./source";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";

interface IEditorSources {
  [key: string]: SourceStore;
}

const isDev = require("@src/env").mode === "development";
export const baseUrl = (isDev ? "http://localhost:8080" : "") + `/api`;

class EditorStore {
  sources: IEditorSources = {};
  @observable name = "";
  @observable path = "";
  @observable status = "loading";
  @observable copied: any = null;
  @observable previewUrl = "";

  @observable modals = {
    store: false,
    storeLock: false,
    customComponents: false,
    customComponentsOpt: {
      header: null,
      footer: null
    },
    project: true,
    expression: false,
    restApi: false,
    hasura: false
  };

  @observable storeDefinitions: { object: any, text: string } = {
    object: {},
    text: ''
  };

  @observable theme = {
    colors: {} as any
  };

  @observable settings: any = {
    name: "",
    backend: {
      port: "11000"
    },
    hasura: {
      port: "10000",
      secret: "hasura123"
    },
    db: {
      port: "5432",
      host: "localhost",
      user: "postgres",
      password: "postgres",
      database: "postgres"
    }
  };

  @computed get isModalOpened() {
    const v = this.modals as any;
    for (let i in v) {
      if (v[i] === true) {
        return true;
      }
    }

    return false;
  }

  async paste() {
    if (this.copied && this.current) {
      if (this.current.selectedId) {
        prepareChanges(this.current);
        insertAfterElementId(
          this.current.source,
          this.current.selectedId,
          toJS(this.copied)
        );
        commitChanges(this.current);
      } else {
        prepareChanges(this.current);
        addChildInId(
          this.current.source,
          this.current.source.id,
          toJS(this.copied)
        );
        commitChanges(this.current);
      }
    }
  }

  async cut() {
    if (this.current && this.current.selectedId) {
      prepareChanges(this.current);
      this.copied = toJS(
        findElementById(this.current.source, this.current.selectedId)
      );
      if (this.copied) {
        delete this.copied.id;
      }
      removeElementById(this.current.source, this.current.selectedId);
    }
    commitChanges(this.current);
  }
  async copy() {
    if (this.current && this.current.selectedId) {
      this.copied = toJS(
        findElementById(this.current.source, this.current.selectedId)
      );
      if (this.copied) {
        delete this.copied.id;
      }
    }
  }

  async loadStoreDefintions(force?: boolean) {
    if (this.storeDefinitions.text === '' || force) {
      const res = await api.get(`store/definition`);
      const declarations = (Object.keys(res).map((k) => {
        return `declare var ${k} = ${generateSource(res[k])};`;
      }).join("\n"));
      this.storeDefinitions = {
        object: res,
        text: declarations
      }
    }
  }

  async load(path: string) {
    this.status = "loading";
    if (this.sources[path]) {
      this.path = path;
      this.status = "ready";
      return;
    }

    try {
      const res = await api.get(`/project/read-source?path=${path}`);
      this.sources[path] = new SourceStore();
      this.sources[path].path = path;
      this.sources[path].project = this;
      this.sources[path].source = res.component;
      this.sources[path].rootSource = res.file;
      this.sources[path].imports = res.imports;
      this.sources[path].hooks = (res.hooks || []).filter((e: any) => !!e);
      this.path = path;
      this.status = "ready";
      localStorage.setItem("cactiva-current-path", path);
      this.loadStoreDefintions();
      this.sources[path].loadStoreDefintions();
    } catch {
      this.status = "failed";
    }
  }

  @computed
  get current() {
    if (this.path && this.sources[this.path]) return this.sources[this.path];
  }

  async setupMonaco(monaco: any, opt?: { local?: boolean }) {
    // compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ["node_modules/@types"],
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: "JSXAlone.createElement"
    });

    let declarations = ""
    if (opt && opt.local && this.current) {
      declarations = this.current.storeDefinitions.text || '';
    } else {
      declarations = this.storeDefinitions.text;
    }

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
      ${declarations}
      declare module '@src/utils/api';
      declare module 'mobx';
       ,`,
      "filename/meta.d.ts"
    );

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false
    });
  }
}

const editor = new EditorStore();
export default editor;
