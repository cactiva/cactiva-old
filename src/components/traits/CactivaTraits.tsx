import { Icon, Text } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { ICactivaTrait, ICactivaTraitField } from "../editor/utility/classes";
import { commitChanges, prepareChanges, uuid, setProp } from "../editor/utility/elements/tools";
import { kindNames } from "../editor/utility/kinds";
import { generateValueByKind, parseValue } from "../editor/utility/parser/parser";
import { isTag } from "../editor/utility/tagmatcher";
import tags from "../editor/utility/tags";
import CactivaTraitField from "./CactivaTraitField";
import "./traits.scss";
import { SyntaxKind } from "../editor/utility/syntaxkinds";
import { toJS } from "mobx";

export default observer(({ editor }: any) => {
  const traits = _.get(editor, "selected.tag.traits", []) as ICactivaTrait[];
  const meta = useObservable({
    expanded: [] as string[],
    wide: false
  });
  const selected = editor.selected;
  const istag = isTag(selected.source);

  let componentFrom = "";
  if (
    istag &&
    !tags[selected.source.name] &&
    !!editor.imports[selected.source.name]
  ) {
    componentFrom = editor.imports[selected.source.name].from;
  }

  useEffect(() => {
    let push = false;
    traits.map((item: ICactivaTrait) => {
      if (push) return;
      if (item.fields.length === 0) return null;
      meta.expanded.push(item.name);
      push = true;
    });
  }, [editor.selectedId])


  return (
    <>
      <div className="cactiva-traits-kind-name">
        <Text>
          {istag ? selected.source.name : kindNames[selected.source.kind]}
        </Text>
      </div>
      {componentFrom && (
        <div style={{ paddingLeft: 10 }}>
          <Text size={300}>
            Imported from:
            <br />
            {componentFrom}
          </Text>
        </div>
      )}

      <div className="cactiva-traits-inner">
        {traits.map((item: ICactivaTrait) => {
          if (item.fields.length === 0) return null;
          return (
            <TraitEl
              meta={meta}
              item={item}
              editor={editor}
              key={uuid("trait")}
            />
          );
        })}
      </div>
    </>
  );
});

const TraitEl = observer((props: any) => {
  const { meta, item, editor } = props;
  const isExpanded = meta.expanded.indexOf(item.name) >= 0;
  const containerRef = useRef(null as any);
  const fields = _.get(item, "fields", []);

  useEffect(() => {
    const div = containerRef.current;
    if (div) {
      meta.wide = div.offsetWidth > 250;
    }
  }, [containerRef.current]);


  return (
    <React.Fragment>
      <div
        className={`heading ${isExpanded ? "" : "collapsed"}`}
        onClick={() => {
          const idx = meta.expanded.indexOf(item.name);
          if (idx >= 0) meta.expanded.splice(idx, 1);
          else meta.expanded.push(item.name);
        }}
      >
        <Text>{item.name}</Text>
        <Icon icon={!isExpanded ? "small-plus" : "small-minus"} />
      </div>
      <div
        className={`cactiva-trait-body ${meta.wide ? "wide" : ""}`}
        ref={containerRef}
      >
        {isExpanded &&
          fields.map((trait: ICactivaTraitField) => {
            return (
              <TraitFieldEl
                key={uuid("traitfield")}
                trait={trait}
                editor={editor}
                item={item}
              />
            );
          })}
      </div>
    </React.Fragment>
  );
});

const TraitFieldEl = observer((props: any) => {
  const { editor, trait, item } = props;
  const selected = editor.selected;
  const currentValue = _.get(selected.source.props, trait.path);
  const kind = _.get(currentValue, "kind", trait.kind);
  const resetValue = () => {
    const currentValue = _.get(selected.source.props, trait.path);
    if (currentValue) {
      prepareChanges(editor);
      const currentValueKeys = Object.keys(currentValue);
      const originalValue = _.get(currentValue, "originalValue");
      if (currentValueKeys.indexOf("originalValue") >= 0) {
        _.set(
          selected.source.props,
          trait.path,
          originalValue === "--undefined--" ? undefined : originalValue
        );
      }
      commitChanges(editor);
    }
  };
  const updateValue = _.debounce((value: any, kind: any) => {
    prepareChanges(editor);
    if (trait.path.indexOf("children") === 0) {
      setProp(selected.source, trait.path, JSON.parse(value));
    } else {
      const sp = selected.source.props;

      if (!sp[item.name] && item.kind && item.default) {
        sp[item.name] = generateValueByKind(item.kind, item.default);
      }

      const isempty =
        value === undefined ||
        (typeof value === "object" && Object.keys(value).length === 0);
      if (!isempty) {
        const currentValue = _.get(selected.source.props, trait.path);

        let valueByKind = null;
        if (typeof value === "function") {
          valueByKind = generateValueByKind(kind, value(currentValue));
        } else {
          valueByKind = generateValueByKind(kind, value);
        }

        setProp(selected.source.props, trait.path, valueByKind);
      } else {
        const tpath = trait.path.split(".");
        const lastpath = tpath.pop();
        const currentValue = _.get(selected.source.props, tpath.join("."));
        if (currentValue) {
          delete currentValue[lastpath as any];
          setProp(selected.source.props, tpath.join("."), currentValue);
        } else {
          return;
        }
      }
    }
    commitChanges(editor);
  });

  let path = `props.${trait.path}`
  if (trait.path.indexOf("children") === 0) {
    path = trait.path;
  }

  const rawValue = _.get(selected.source, path);
  const update = (value: any, updatedKind?: any) => {
    updateValue(
      value === undefined ? item.default : value,
      updatedKind ? updatedKind : _.get(currentValue, "kind", trait.kind)
    );
  };
  return (
    <React.Fragment>
      <CactivaTraitField
        {...trait}
        kind={kind || trait.kind}
        defaultKind={trait.kind}
        editor={editor}
        resetValue={resetValue}
        update={update}
        source={selected.source}
        rawValue={rawValue}
        value={parseValue(rawValue)}
      />
    </React.Fragment>
  );
});
