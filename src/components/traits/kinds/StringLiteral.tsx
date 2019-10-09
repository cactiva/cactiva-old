import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { ICactivaTraitFieldProps } from '../CactivaTraitField';
import './StringLiteral.scss';
import { SelectMenu, Tooltip, IconButton } from 'evergreen-ui';
import IconBrowse from './components/IconBrowse';
import IconMaps from './components/IconMaps';
import { parseValue } from '@src/components/editor/utility/parser/parser';
import * as IconSource from 'react-web-vector-icons';
import { toJS } from 'mobx';

const Icons = IconMaps();
export default observer((trait: ICactivaTraitFieldProps) => {
  const meta = useObservable({
    value: trait.value,
    isShown: false
  });

  const icon = useObservable({
    source: 'Entypo',
    search: '',
    list: Icons['Entypo']
  });

  useEffect(() => {
    meta.value = trait.value;
  }, [trait.value]);

  useEffect(() => {
    icon.source = parseValue(trait.source.props.source);
  }, [trait]);
  return (
    <>
      {!trait.mode && (
        <div
          className={`trait-string-literal`}
          style={{ ...trait.style, flexDirection: 'row' }}
        >
          <input
            className={`cactiva-trait-input`}
            type="text"
            value={meta.value || ''}
            onChange={e => {
              meta.value = e.target.value;
            }}
            onFocus={e => {
              e.target.select();
            }}
            onBlur={() => {
              trait.update(`"${meta.value}"`);
            }}
          />
        </div>
      )}

      {trait.mode &&
        trait.mode === 'select' &&
        trait.options &&
        trait.options.items && (
          <div
            className={`trait-string-literal`}
            style={{ ...trait.style, flexDirection: 'row' }}
          >
            <select
              className={`cactiva-trait-select`}
              value={meta.value || trait.default}
              onChange={e => {
                meta.value = e.target.value;
                trait.update(`"${meta.value}"`);
              }}
            >
              <option disabled={meta.value} value={''}>
                Select ...
              </option>
              {trait.options.items.map((item: any, i: number) => {
                return (
                  <option key={i} value={`${item.value}`}>
                    {item.label}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      {trait.mode && trait.mode === 'icon' && (
        <div
          className={`trait-string-literal cactiva-trait-icon`}
          style={{ ...trait.style, flexDirection: 'row', alignItems: 'center' }}
        >
          <div className="icon-wrapper">
            <div className="toolbar">
              <div className={`icon-selected`}>
                <Icon source={icon.source} name={meta.value} size={18} />
              </div>
              <input
                className={`cactiva-trait-input input`}
                type="text"
                value={icon.search}
                onChange={e => {
                  icon.search = e.target.value;
                }}
                onFocus={e => {
                  e.target.select();
                }}
              />
            </div>
            <div className={`list`}>
              {icon.list.map((name: any, idx: number) => {
                return (
                  <div key={idx} className="icon">
                    <Icon source={icon.source} name={name} size={18} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

const Icon = ({ source, name, size, color, style }: any) => {
  const Icon: any = (IconSource as any)[source];

  return <Icon name={name} size={size} color={color} style={style} />;
};
