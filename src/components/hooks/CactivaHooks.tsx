import { IconButton, Popover } from "evergreen-ui";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import MonacoEditor from "react-monaco-editor";
import {
  commitChanges,
  prepareChanges,
  uuid
} from "../editor/utility/elements/tools";
import "./CactivaHooks.scss";

export default observer(({ editor }: any) => {
  const meta = useObservable({
    hookOpenKey: null as any,
    loading: false,
    source: "",
    name: "",
    isShown: false
  });
  const hookOptions = [
    {
      key: "A",
      text: "useObservable",
      value: `useObservable({\n\n})`
    },
    {
      key: "B",
      text: "useEffect",
      value: `useEffect(() => {\n\n}, [])`
    },
    {
      key: "C",
      text: "useNavigation",
      defaultKey: "nav",
      value: `useNavigation()`
    },
    {
      key: "D",
      text: "useDimensions",
      defaultKey: "dim",
      value: `useDimensions().window`
    }
  ];
  const onChange = (e: any) => {
    const key = e.target.value;
    if (!!key) {
      const hook: any = hookOptions.find(x => x.key === key);
      editor.hooks.push({
        name: hook.defaultKey || "",
        type: hook.text,
        value: hook.value
      });
      meta.hookOpenKey = editor.hooks.length - 1;
    }
  };
  return (
    <div className={`cactiva-hook`}>
      <div className={`cactiva-hook-items`}>
        {editor.hooks.map((item: any, idx: number) => {
          return (
            <HookEl
              key={uuid("cactivahook")}
              meta={meta}
              editor={editor}
              idx={idx}
              item={item}
            />
          );
        })}
      </div>
      <div className={`cactiva-hook-options`}>
        <select
          className={`cactiva-hook-select`}
          onChange={onChange}
          value={""}
        >
          <option>Select ...</option>
          {hookOptions.map((item: any) => {
            return <OptionEl key={uuid("hookoption")} item={item} />;
          })}
        </select>
      </div>
    </div>
  );
});

const OptionEl = observer((props: any) => {
  const { item } = props;
  return <option value={item.key}>{item.text}</option>;
});

const HookEl = observer((props: any) => {
  const { meta, editor, idx, item } = props;
  const onChange = (e: any) => {
    meta.name = e.nativeEvent.target.value.replace(
      /^[^a-zA-Z_$]|[^0-9a-zA-Z_$]/gi,
      ""
    );
  };
  const editorWillMount = (monaco: any) => {
    editor.setupMonaco(monaco);
  };
  const onClose = () => {
    meta.isShown = false;
    if (!meta.name || !meta.source) {
      meta.isShown = true;
    } else {
      prepareChanges(editor);
      editor.hooks[idx].name = meta.name;
      editor.hooks[idx].value = meta.source;
      commitChanges(editor);
      meta.name = "";
      meta.source = "";
    }
  };
  return (
    <Popover
      position="left"
      onClose={onClose}
      minWidth={500}
      minHeight={400}
      content={
        <div className={`cactiva-hook-editor`}>
          <div className={`editor-name`}>
            <div>
              Const <input value={meta.name} onChange={onChange} /> =
            </div>
            {!meta.name && <label>⚠️ Variable name is required!</label>}
          </div>
          <MonacoEditor
            theme="vs-dark"
            value={meta.source}
            onChange={value => {
              meta.source = value;
            }}
            editorWillMount={editorWillMount}
            width="100%"
            height="100%"
            language="typescript"
          />
        </div>
      }
    >
      {({ getRef, toggle }) => {
        const onClick = (e: any) => {
          meta.hookOpenKey = idx;
          meta.source = item.value;
          meta.name = item.name;
          getRef(e.nativeEvent.target);
          toggle();
        };
        const onClickBtn = () => {
          prepareChanges(editor);
          editor.hooks.splice(idx, 1);
          commitChanges(editor);
        };
        return (
          <div className={`cactiva-hook-item`}>
            <div className={`cactiva-hook-label`} onClick={onClick}>
              <div className={`cactiva-hook-name`}>{item.name}</div>
              <div className={`cactiva-hook-type`}>
                {item.type.replace("use", "")}
              </div>
            </div>
            <IconButton
              icon="trash"
              intent="danger"
              height={20}
              onClick={onClickBtn}
            />
          </div>
        );
      }}
    </Popover>
  );
});
