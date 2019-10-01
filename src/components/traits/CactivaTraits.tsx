import { Icon, Text } from 'evergreen-ui';
import _ from 'lodash';
import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import { ICactivaTraitField } from '../editor/utility/tags';
import CactivaTraitField from './CactivaTraitField';
import './traits.scss';
import { toJS } from 'mobx';

export default observer(({ source, editor }: any) => {
  const traits = _.get(editor, 'selected.tag.traits');
  const meta = useObservable({
    expanded: ['attributes', 'style'] as string[]
  });
  const selected = editor.selected;
  if (!traits) {
    return <Text>Trait not found...</Text>;
  }
  return (
    <div className='cactiva-traits-inner'>
      {traits.map((item: any, key: number) => {
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
                return (
                  <CactivaTraitField
                    key={key}
                    {...trait}
                    editor={editor}
                    path={`props.${item.name}.${trait.name}`}
                    source={selected.source}
                  />
                );
              })}
          </React.Fragment>
        );
      })}
    </div>
  );
});
