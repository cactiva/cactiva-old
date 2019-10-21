import Axios from "axios";
import { computed, observable, toJS } from "mobx";
import { SourceStore } from "./source";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";

interface IEditorSources {
  [key: string]: SourceStore;
}

export const baseUrl = "http://localhost:8080/api";

class EditorStore {
  sources: IEditorSources = {};
  @observable name = "";
  @observable path = "";
  @observable status = "loading";

  @observable cli = {
    status: "stopped",
    logs: ""
  };

  async load(path: string) {
    this.status = "loading";
    if (this.sources[path]) {
      this.path = path;
      this.status = "ready";
      return;
    }
    const apiPath = "/project/read-source?path=";
    await Axios.get(`${baseUrl}${apiPath}${path}`)
      .then(res => {
        let root = res.data.component;

        this.sources[path] = new SourceStore(root, path);
        this.sources[path].rootSource = res.data.file;
        this.sources[path].project = this;
        this.sources[path].imports = res.data.imports;

        this.path = path;
        this.status = "ready";
        localStorage.setItem("cactiva-current-path", path);
      })
      .catch(e => {
        this.status = "failed";
      });
  }

  @computed
  get current() {
    if (this.path && this.sources[this.path]) return this.sources[this.path];
  }
}

const editor = new EditorStore();
export default editor;
