import {
  commitChanges,
  prepareChanges,
  replaceElementById
} from "@src/components/editor/utility/elements/tools";
import { generateSource } from "@src/components/editor/utility/parser/generateSource";
import api from "@src/libs/api";
import _ from "lodash";
import { computed, observable, toJS } from "mobx";
import typescript from "prettier/parser-typescript";
import prettier from "prettier/standalone";
import editor from "./editor";

export class SourceStore {
  project = null as any;
  lastId = 1;

  cactivaRefs: any = {};
  @observable path = "";
  @observable source: any = {};
  @observable rootSource: string = "";
  @observable rootSourceTemp: string = "";
  @observable imports = {};
  @observable hooks = [];

  @observable storeDefinitions: { object: any, text: string } = {
    object: {},
    text: ''
  };

  @observable rootSelected = false;
  @observable selectedId = "";
  @observable selected: any;
  @observable selectedSource: string = "";
  @observable renderfont = true;
  @observable jsx = false;
  @observable traitPane = false;
  @observable addComponentInfo: any = null;
  @observable trait = {
    dividerExpanded: [] as string[]
  };

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
        if (!popped.kind && Array.isArray(popped)) { // hooks
          const prevHooks = this.hooks;
          this.hooks = toJS(popped) as any;
          target.push(prevHooks);
        } else { // source code
          const prevSource = toJS(this.source);
          this.source = toJS(popped);
          target.push(prevSource);
        }
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

  async loadStoreDefintions(force?: boolean) {
    if (this.storeDefinitions.text === '' || force) {
      let path = `?path=${this.path}`;
      const res = await api.get(`store/definition${path}`);
      const declarations = (Object.keys(res).map((k) => {
        return `declare var ${k} = ${generateSource(res[k])};`;
      }).join("\n"));
      this.storeDefinitions = {
        object: res,
        text: declarations
      }
    }
  }

  async save() {
    this.project.status = "saving";

    let source = "";
    if (this.rootSelected) {
      if (this.rootSourceTemp) source = this.rootSourceTemp;
      else source = this.getSourceCode();
    } else {
      if (!(await this.applySelectedSource())) {
        return;
      }
      source = this.getSourceCode();
    }

    try {
      const res = await api.post(`project/write-source?path=${this.path}`, {
        raw: this.rootSelected ? "y" : "n",
        value: JSON.stringify(source),
        hooks: this.hooks,
        imports: this.imports
      });
      this.rootSource = res.file;
      this.hooks = (res.hooks || []).filter((e: any) => !!e);
      this.imports = res.imports;
      this.rootSourceTemp = "";
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
    try {
      return prettier.format(
        this.rootSource.replace("<<<<cactiva>>>>", generateSource(this.source)),
        {
          parser: "typescript",
          plugins: [typescript]
        }
      );
    } catch (e) {
      return this.rootSource.replace(
        "<<<<cactiva>>>>",
        generateSource(this.source)
      );
    }
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
