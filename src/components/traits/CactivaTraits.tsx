import { Text } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { ICactivaTrait, ICactivaTraitField } from "../editor/utility/classes";
import { commitChanges, prepareChanges } from "../editor/utility/elements/tools";
import { kindNames } from "../editor/utility/kinds";
import { generateValueByKind, parseValue } from "../editor/utility/parser/parser";
import { isTag } from "../editor/utility/tagmatcher";
import CactivaTraitField from "./CactivaTraitField";
import "./traits.scss";
import { toJS } from "mobx";
import tags from "../editor/utility/tags";

export default observer(({ editor }: any) => {
  const traits = _.get(editor, "selected.tag.traits") as ICactivaTrait[];
  const meta = useObservable({
    expanded: ["attributes", "style"] as string[],
    wide: false
  });
  const selected = editor.selected;
  const containerRef = useRef(null as any);
  const istag = isTag(selected.source);

  let componentFrom = "";
  if (istag && !tags[selected.source.name] && !!editor.imports[selected.source.name]) {
    componentFrom = editor.imports[selected.source.name].from;
  }

  useEffect(() => {
    const div = containerRef.current;
    if (div) {
      meta.wide = div.offsetWidth > 250;
    }
  }, [containerRef.current]);

  return (
    <>
      <div className="cactiva-traits-kind-name">
        <Text>
          {istag
            ? selected.source.name
            : kindNames[selected.source.kind]}
        </Text>
      </div>
      {componentFrom && <div style={{ paddingLeft: 10 }}><Text size={300}>
        Imported from:<br />{componentFrom}
      </Text></div>}

      <div className="cactiva-traits-inner">
        {(traits || []).map((item: ICactivaTrait, key: number) => {
          const isExpanded = meta.expanded.indexOf(item.name) >= 0;
          return (
            <React.Fragment key={key}>
              <div
                className={`cactiva-trait-body ${meta.wide ? "wide" : ""}`}
                ref={containerRef}
              >
                {isExpanded &&
                  item.fields.map((trait: ICactivaTraitField, key: number) => {
                    const currentValue = _.get(
                      selected.source.props,
                      trait.path
                    );
                    const kind = _.get(currentValue, "kind", trait.kind);
                    const resetValue = () => {
                      const currentValue = _.get(
                        selected.source.props,
                        trait.path
                      );
                      if (currentValue) {
                        prepareChanges(editor);
                        const currentValueKeys = Object.keys(currentValue);
                        const originalValue = _.get(
                          currentValue,
                          "originalValue"
                        );
                        if (currentValueKeys.indexOf("originalValue") >= 0) {
                          _.set(
                            selected.source.props,
                            trait.path,
                            originalValue === "--undefined--"
                              ? undefined
                              : originalValue
                          );
                        }
                        commitChanges(editor);
                      }
                    };
                    const updateValue = _.debounce((value: any, kind: any) => {
                      prepareChanges(editor);
                      const sp = selected.source.props;

                      if (!sp[item.name] && item.kind && item.default) {
                        sp[item.name] = generateValueByKind(
                          item.kind,
                          item.default
                        );
                      }

                      const isempty = value === undefined || typeof value === 'object' && Object.keys(value).length === 0;
                      if (!isempty) {
                        const currentValue = _.get(
                          selected.source.props,
                          trait.path
                        );

                        let valueByKind = null;
                        if (typeof value === "function") {
                          valueByKind = generateValueByKind(
                            kind,
                            value(currentValue)
                          );
                        } else {
                          valueByKind = generateValueByKind(kind, value);
                        }

                        _.set(selected.source.props, trait.path, valueByKind);
                      } else {
                        const tpath = trait.path.split(".");
                        const lastpath = tpath.pop();
                        const currentValue = _.get(
                          selected.source.props,
                          tpath.join(".")
                        );
                        delete currentValue[lastpath as any];
                        _.set(selected.source.props, tpath.join("."), currentValue);
                      }
                      commitChanges(editor);
                    });
                    const rawValue = _.get(
                      selected.source.props,
                      `${trait.path}`
                    );
                    return (
                      <React.Fragment key={key}>
                        <CactivaTraitField
                          key={key}
                          {...trait}
                          kind={kind || trait.kind}
                          defaultKind={trait.kind}
                          editor={editor}
                          resetValue={resetValue}
                          update={(value, updatedKind?) => {
                            updateValue(
                              value === undefined ? item.default : value,
                              updatedKind
                                ? updatedKind
                                : _.get(currentValue, "kind", trait.kind)
                            );
                          }}
                          source={selected.source}
                          rawValue={rawValue}
                          value={parseValue(rawValue)}
                        />
                      </React.Fragment>
                    );
                  })}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
});
