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

export default observer(({ editor }: any) => {
  const traits = _.get(editor, "selected.tag.traits") as ICactivaTrait[];
  const meta = useObservable({
    expanded: ["attributes", "style"] as string[],
    wide: false
  });
  const selected = editor.selected;
  const containerRef = useRef(null as any);

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
          {isTag(selected.source)
            ? selected.source.name
            : kindNames[selected.source.kind]}
        </Text>
      </div>
      <div className="cactiva-traits-inner">
        {(traits || []).map((item: ICactivaTrait, key: number) => {
          const isExpanded = meta.expanded.indexOf(item.name) >= 0;
          return (
            <React.Fragment key={key}>
              {/* <div
              className={`heading ${isExpanded ? "" : "collapsed"}`}
              onClick={() => {
                const idx = meta.expanded.indexOf(item.name);
                if (idx >= 0) meta.expanded.splice(idx, 1);
                else meta.expanded.push(item.name);
              }}
            >
              <Text>{item.name}</Text>
              <Icon icon={!isExpanded ? "small-plus" : "small-minus"} />
            </div> */}
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
