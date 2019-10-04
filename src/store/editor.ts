import Axios from 'axios';
import { computed, observable } from 'mobx';
import { SourceStore } from './source';

interface IEditorSources {
  [key: string]: SourceStore;
}

export const baseUrl = 'http://localhost:8080/api';

class EditorStore {
  sources: IEditorSources = {};
  @observable path = '';
  @observable status = 'loading';

  async load(path: string) {
    this.status = 'loading';
    const apiPath = '/project/read-source?path=';
    await Axios.get(`${baseUrl}${apiPath}${path}`)
      .then(res => {
        this.sources[path] = new SourceStore(res.data);
        this.path = path;
        this.status = 'ready';
      })
      .catch(e => {
        this.status = 'failed';
      });
  }

  @computed
  get current() {
    if (this.path && this.sources[this.path]) return this.sources[this.path];
  }
}

const editor = new EditorStore();
export default editor;
