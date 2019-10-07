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

  setupMonaco(monaco: any) {
    // compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ['node_modules/@types'],
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'JSXAlone.createElement'
    });

    // extra libraries
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
      declare var meta:any;
      declare var Main:any;
       ,`,
      'filename/meta.d.ts'
    );

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false
    });
  }
}
