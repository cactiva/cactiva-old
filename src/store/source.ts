import { observable, toJS } from 'mobx';
import { applyDiff, getDiff } from 'recursive-diff';

export class SourceStore {
  @observable path = '';
  lastId = 1;
  @observable source: any = {};
  root = null;

  @observable selectedId = '';
  @observable selected: any;

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
  cactivaRefs: any = {};

  constructor(source: any) {
    this.source = source;
  }
}
