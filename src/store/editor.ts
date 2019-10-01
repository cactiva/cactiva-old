import Axios from 'axios';
import { computed, observable } from 'mobx';
import { SourceStore } from './source';

interface IEditorSources {
  [key: string]: SourceStore;
}

const baseUrl = 'http://localhost:8080/api';

class EditorStore {
  sources: IEditorSources = {};
  @observable path = '';

  async load(path: string) {
    const apiPath = '/project/read-source?path=';
    const res = await Axios.get(`${baseUrl}${apiPath}${path}`);
    this.sources[path] = new SourceStore(res.data);
    this.path = path;
  }

  @computed
  get current() {
    if (this.path && this.sources[this.path]) return this.sources[this.path];
  }
}

const editor = new EditorStore();
export default editor;
