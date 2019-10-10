import {
  commitChanges,
  prepareChanges,
  replaceElementById
} from "@src/components/editor/utility/elements/tools";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import api from "@src/libs/api";
import { observable, toJS, computed } from "mobx";
import typescript from "prettier/parser-typescript";
import prettier from "prettier/standalone";
import { applyDiff, getDiff } from "recursive-diff";
import _ from "lodash";

export class SourceStore {
  project = null as any;
  lastId = 1;
  @observable path = "";
  @observable source: any = {};
  @observable rootSource: string = "";

  @observable rootSelected = false;
  @observable selectedId = "";
  @observable selected: any;
  @observable selectedSource: string = "";
  async applySelectedSource() {
    if (!this.selectedSource) {
      return true;
    }
    if (this.rootSelected) {
      try {
        const res = await api.post(`project/write-source`, {
          value: JSON.stringify(this.selectedSource)
        });
        this.rootSource = res.file;
        prepareChanges(this);
        this.source = res.component;
        commitChanges(this);
        this.selectedSource = "";
        return true;
      } catch (e) {
        this.project.status = "changes error, please discard";
      }
    } else {
      try {
        const parsed = await api.post("morph/jsx2ast", {
          value: JSON.stringify(this.selectedSource)
        });

        prepareChanges(this);
        replaceElementById(this.selected.root, this.selectedId, parsed);
        commitChanges(this);

        this.project.status = "changes applied";
        setTimeout(() => {
          this.project.status = "ready";
        }, 2000);

        this.selectedSource = "";
        return true;
      } catch (e) {
        this.project.status = "changes error, please discard";
      }
    }
    return false;
  }

  prevSource = null;
  @observable undoStack: any = [];
  @observable redoStack: any = [];
  history = {
    swap: (source: any[], target: any[]) => {
      if (source.length > 0) {
        const popped = source.pop();
        const prevSource = toJS(this.source);
        this.source = applyDiff(toJS(this.source), popped);
        target.push(getDiff(toJS(this.source), prevSource));
      }
    },
    undo: () => {
      this.history.swap(this.undoStack, this.redoStack);
    },
    redo: () => {
      this.history.swap(this.redoStack, this.undoStack);
    }
  };
  @observable savedMarker = {
    undoIndex: -1,
    undoContent: null
  };

  @computed
  get isSaved() {
    if (this.rootSelected && !!this.selectedSource) {
      return false;
    }
    if (this.undoStack.length - 1 === this.savedMarker.undoIndex) {
      if (
        this.undoStack.length - 1 === -1 ||
        this.undoStack[this.undoStack.length - 1] ===
          this.savedMarker.undoContent
      ) {
        return true;
      }
    }

    return false;
  }

  cactivaRefs: any = {};

  constructor(source: any, path: any) {
    this.source = source;
    this.path = path;
  }

  setupMonaco(monaco: any) {
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

    // extra libraries
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
      declare var meta:any;
      declare var Main:any;
       ,`,
      "filename/meta.d.ts"
    );

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false
    });
  }

  async save() {
    this.project.status = "saving";

    let source = "";
    if (this.rootSelected && this.selectedSource) {
      source = this.selectedSource;
    } else {
      if (!(await this.applySelectedSource())) {
        return;
      }
      source = this.getSourceCode();
    }

    try {
      const res = await api.post(`project/write-source?path=${this.path}`, {
        value: JSON.stringify(source)
      });
      this.rootSource = res.file;
      this.source = res.component;
      this.project.status = "ready";
      this.savedMarker.undoIndex = this.undoStack.length - 1;
      this.savedMarker.undoContent = this.undoStack[this.undoStack.length - 1];

      if (this.rootSelected) {
        this.selectedSource = "";
      }
    } catch (e) {
      this.project.status = "changes error, please discard";
    }
  }

  getSourceCode() {
    const result = prettier.format(
      this.rootSource.replace("<<<<cactiva>>>>", generateSource(this.source)),
      {
        parser: "typescript",
        plugins: [typescript]
      }
    );

    return result;
  }

  getSelectedSourceCode() {
    const result = _.get(this, "selected.source")
      ? prettier
          .format(generateSource(this.selected.source), {
            parser: "typescript",
            plugins: [typescript]
          })
          .trim()
      : "";

    if (result[result.length - 1] === ";")
      return result.substr(0, result.length - 1);

    if (result.substr(result.length - 3) === ";\n}")
      return result.substr(0, result.length - 3) + "\n}";
    return result;
  }
}
