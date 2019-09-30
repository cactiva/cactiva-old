import { json, Undo } from '@src/libs/json-mobx';
import { observable } from 'mobx';

export class SourceStore {
  @observable path = '';
  lastId = 1;
  @json @observable source: any = {};
  root = null;

  historyState: any;
  history: any;
  @observable selected = null;

  constructor(source: any) {
    this.source = source;
    this.history = new Undo(this, after => (this.historyState = after));
  }

  destroy() {
    this.history.dispose();
  }
}
