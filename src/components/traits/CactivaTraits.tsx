import { Icon, Text } from 'evergreen-ui';
import _ from 'lodash';
import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import { ICactivaTraitField, ICactivaTrait } from '../editor/utility/tags';
import CactivaTraitField from './CactivaTraitField';
import './traits.scss';
import {parseProps, generateValueByKind, parseValue} from '../editor/utility/parser';
import { toJS } from 'mobx';
import {
  prepareChanges,
  commitChanges
} from '../editor/utility/elements/tools';
import { SyntaxKind } from '../editor/utility/kinds';

export default observer(({ source, editor }: any) => {
  const traits = _.get(editor, 'selected.tag.traits') as ICactivaTrait[];
  const meta = useObservable({
    expanded: ['attributes', 'style'] as string[]
  });
  const selected = editor.selected;
  if (!traits || !selected) {
    return <Text>Trait not found...</Text>;
  }

  const props = parseProps(selected.source.props);

  return (
    <div className='cactiva-traits-inner'>
      {traits.map((item: ICactivaTrait, key: number) => {
        return (
          <React.Fragment key={key}>
            <div
              className='heading'
              onClick={() => {
                const idx = meta.expanded.indexOf(item.name);
                if (idx >= 0) meta.expanded.splice(idx, 1);
                else meta.expanded.push(item.name);
              }}
            >
              <Text>{item.name}</Text>
              <Icon
                icon={
                  meta.expanded.indexOf(item.name) < 0
                    ? 'small-plus'
                    : 'small-minus'
                }
              />
            </div>
            <div className='cactiva-trait-body'>
              {meta.expanded.indexOf(item.name) >= 0 &&
                item.fields.map((trait: ICactivaTraitField, key: number) => {
                  const currentValue = _.get(selected.source.props, trait.path);
                  const kind = _.get(currentValue, 'kind', trait.kind);
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
                        'originalValue'
                      );
                      if (currentValueKeys.indexOf('originalValue') >= 0) {
                        _.set(
                          selected.source.props,
                          trait.path,
                          originalValue === '--undefined--'
                            ? undefined
                            : originalValue
                        );
                      }
                      commitChanges(editor);
                    }
                  };
                  const updateValue = (value: any, kind: any) => {
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
                    if (typeof value === 'function') {
                      valueByKind = generateValueByKind(
                        kind,
                        value(currentValue)
                      );
                    } else {
                      valueByKind = generateValueByKind(kind, value);
                    }

                    const shouldSetOriginalValue =
                      ((typeof currentValue === 'object' &&
                        Object.keys(currentValue).indexOf('originalValue') <
                          0) ||
                        typeof currentValue !== 'object') &&
                      valueByKind;

                    if (shouldSetOriginalValue) {
                      valueByKind.originalValue =
                        currentValue || '--undefined--';
                    } else {
                      if (currentValue && currentValue.originalValue)
                        valueByKind.originalValue = currentValue.originalValue;
                    }

                    _.set(selected.source.props, trait.path, valueByKind);
                    commitChanges(editor);
                  };
                  return (
                    <React.Fragment key={key}>
                      <CactivaTraitField
                        key={key}
                        {...trait}
                        kind={kind || trait.kind}
                        defaultKind={trait.kind}
                        editor={editor}
                        resetValue={resetValue}
                        convertToCode={() => {
                          updateValue((value: any) => {
                            return _.get(value, 'value', value);
                          }, SyntaxKind.CactivaCode);
                        }}
                        update={(value, updatedKind?) => {
                          updateValue(
                            value === undefined ? item.default : value,
                            updatedKind ? updatedKind : _.get(currentValue, 'kind', trait.kind)
                          );
                        }}
                        source={selected.source}
                        value={parseValue(_.get(props, `${trait.path}`))}
                      />
                    </React.Fragment>
                  );
                })}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
});
