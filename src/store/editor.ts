import {
  addChildInId,
  commitChanges,
  findElementById,
  insertAfterElementId,
  prepareChanges,
  removeElementById
} from "@src/components/editor/utility/elements/tools";
import Axios from "axios";
import { computed, observable, toJS } from "mobx";
import { SourceStore } from "./source";

interface IEditorSources {
  [key: string]: SourceStore;
}

export const baseUrl = "http://localhost:8080/api";

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
    api: false,
    apiLock: false,
    customComponents: false,
    project: false,
    expression: false
  };

  @observable backend = {
    status: "stopped",
    logs: ""
  };
  @observable hasura = {
    status: "stopped",
    logs: ""
  };
  @observable expo = {
    status: "stopped",
    url: "",
    logs: ""
  };

  @observable settings: any = {
    name: "",
    apiUrl: window.location,
    db: {
      port: "5432",
      host: "localhost",
      username: "postgres",
      password: "postgres",
      name: "postgres"
    }
  };

  @computed get isModalOpened() {
    const v = this.modals as any;
    for (let i in v) {
      if (!!v[i]) return true;
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

  async load(path: string) {
    this.status = "loading";
    if (this.sources[path]) {
      this.path = path;
      this.status = "ready";
      return;
    }
    const apiPath = "/project/read-source?path=";
    try {
      const res = await Axios.get(`${baseUrl}${apiPath}${path}`);
      this.sources[path] = new SourceStore();
      this.sources[path].path = path;
      this.sources[path].source = res.data.component;
      this.sources[path].rootSource = res.data.file;
      this.sources[path].project = this;
      this.sources[path].imports = res.data.imports;
      this.sources[path].hooks = res.data.hooks;
      this.path = path;
      this.status = "ready";
      localStorage.setItem("cactiva-current-path", path);
    } catch {
      this.status = "failed";
    }
  }

  @computed
  get current() {
    if (this.path && this.sources[this.path]) return this.sources[this.path];
  }
}

const editor = new EditorStore();
export default editor;
