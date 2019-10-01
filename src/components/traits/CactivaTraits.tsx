import { Icon, Text } from 'evergreen-ui';
import _ from 'lodash';
import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import { ICactivaTraitField, ICactivaTrait } from '../editor/utility/tags';
import CactivaTraitField from './CactivaTraitField';
import './traits.scss';
import { parseProps, generateValueByKind } from '../editor/utility/parser';
import { toJS } from 'mobx';
import {
  prepareChanges,
  commitChanges
} from '../editor/utility/elements/tools';
import { SyntaxKind } from '../editor/utility/syntaxkind';

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
            {meta.expanded.indexOf(item.name) >= 0 &&
              item.fields.map((trait: ICactivaTraitField, key: number) => {
                const currentValue = _.get(selected.source.props, trait.path);
                const kind = _.get(currentValue, 'kind', trait.kind);
                const resetValue = () => {
                  const currentValue = _.get(selected.source.props, trait.path);
                  if (currentValue) {
                    prepareChanges(editor);
                    const currentValueKeys = Object.keys(currentValue);
                    if (currentValueKeys.indexOf('originalValue') >= 0) {
                      _.set(
                        selected.source.props,
                        trait.path,
                        _.get(currentValue, 'originalValue')
                      );
                    }
                    commitChanges(editor);
                  }
                };
                return (
                  <React.Fragment key={key}>
                    <CactivaTraitField
                      key={key}
                      {...trait}
                      kind={kind || trait.kind}
                      editor={editor}
                      resetValue={resetValue}
                      convertToCode={() => {
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

                        const valueByKind = generateValueByKind(
                          SyntaxKind.CactivaCode,
                          _.get(currentValue, 'value', currentValue)
                        );

                        if (valueByKind) {
                          valueByKind.originalValue = _.get(
                            currentValue,
                            'originalValue',
                            currentValue
                          );
                        }
                        _.set(selected.source.props, trait.path, valueByKind);
                        commitChanges(editor);
                      }}
                      update={(value: any) => {
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

                        const kind = _.get(currentValue, 'kind', trait.kind);
                        const valueByKind = generateValueByKind(
                          kind,
                          value || item.default
                        );

                        if (valueByKind) {
                          valueByKind.originalValue = _.get(
                            currentValue,
                            'originalValue',
                            currentValue
                          );
                        }
                        _.set(selected.source.props, trait.path, valueByKind);
                        commitChanges(editor);
                      }}
                      source={selected.source}
                      value={_.get(props, `${item.name}.${trait.name}`)}
                    />
                  </React.Fragment>
                );
              })}
          </React.Fragment>
        );
      })}
    </div>
  );
});
