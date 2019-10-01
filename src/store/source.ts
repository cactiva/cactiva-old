import { observable, toJS, computed } from 'mobx';
import { applyDiff, getDiff } from 'recursive-diff';
import { findElementById } from '@src/components/editor/utility/elements/tools';

export class SourceStore {
  @observable path = '';
  lastId = 1;
  @observable source: any = {};
  root = null;

  @observable selectedId = '';
  @computed
  get selected() {
    if (this.selectedId) {
      return findElementById(this.source, this.selectedId);
    }
  }

  prevSource = null;
  history = {
    undoStack: [] as any,
    redoStack: [] as any,
    swap: (source: any[], target: any[]) => {
      if (source.length > 0) {
        const popped = source.pop();
        const prevSource = toJS(this.source);
        this.source = applyDiff(toJS(this.source), popped);
        target.push(getDiff(toJS(this.source), prevSource));
      }
    },
    undo: () => {
      this.history.swap(this.history.undoStack, this.history.redoStack);
    },
    redo: () => {
      this.history.swap(this.history.redoStack, this.history.undoStack);
    }
  };

  constructor(source: any) {
    this.source = source;
  }
}
