import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { ICactivaTraitFieldProps } from '../CactivaTraitField';
import './StringLiteral.scss';
import {
  SelectMenu,
  Tooltip,
  IconButton,
  Popover,
  Pane,
  RadioGroup,
  Text,
  Button
} from 'evergreen-ui';
import IconBrowse from './components/IconBrowse';
import IconMaps from './components/IconMaps';
import { parseValue } from '@src/components/editor/utility/parser/parser';
import * as IconSource from 'react-web-vector-icons';
import { toJS } from 'mobx';
import _ from 'lodash';
import { SketchPicker } from 'react-color';

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

  const optionItems = _.get(trait, 'options.items', []);
  useEffect(() => {
    meta.value = trait.value;
  }, [trait.value]);

  useEffect(() => {
    if (_.get(trait, 'mode') === 'icon') {
      icon.source = parseValue(trait.source.props.source);
      icon.list = Icons[icon.source].filter((x: string) =>
        x.toLowerCase().includes(icon.search)
      );
    }
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

      {trait.mode === 'icon' && (
        <div
          className={`trait-string-literal cactiva-trait-icon`}
          style={{ ...trait.style, flexDirection: 'row', alignItems: 'center' }}
        >
          <div className="icon-wrapper">
            <div className="toolbar">
              <div className={`icon-selected`}>
                <Icon source={icon.source} name={meta.value} size={20} />
              </div>
              <input
                className={`cactiva-trait-input input`}
                placeholder="Search"
                type="text"
                value={icon.search}
                onChange={e => {
                  let v = e.target.value.toLowerCase();
                  icon.search = v;
                  icon.list = Icons[icon.source].filter((x: string) =>
                    x.toLowerCase().includes(v)
                  );
                }}
                onFocus={e => {
                  e.target.select();
                }}
              />
            </div>
            <div className={`list`}>
              {icon.list.map((name: any, idx: number) => {
                return (
                  <div
                    key={idx}
                    className={`icon ${meta.value === name ? 'active' : ''}`}
                    onClick={() => {
                      trait.update(`"${name}"`);
                    }}
                  >
                    <Icon source={icon.source} name={name} size={18} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {trait.mode === 'color' && (
        <div className="cactiva-trait-color-picker">
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
          <Popover
            content={
              <Pane
                display="flex"
                alignItems="stretch"
                justifyContent="center"
                flexDirection="column"
              >
                <SketchPicker
                  onChangeComplete={(v: any) => {
                    meta.value = v.hex;
                    if (v.rgb.a < 1) {
                      meta.value = `rgba(${Object.values(v.rgb)})`;
                    }
                    trait.update(`"${meta.value}"`);
                  }}
                  color={meta.value}
                  css
                />
              </Pane>
            }
          >
            <IconButton icon="heatmap" height={20} color={meta.value} />
          </Popover>
        </div>
      )}

      {trait.mode === 'radio' && optionItems.length > 0 && (
        <div className="cactiva-trait-radio">
          {optionItems.map((item: any, idx: number) => {
            return (
              <Tooltip
                key={idx}
                showDelay={300}
                content={
                  <Text
                    color={'white'}
                    fontSize={'10px'}
                    textTransform={'capitalize'}
                  >
                    {item.label}
                  </Text>
                }
                position="top"
              >
                {item.mode === 'icon' ? (
                  <IconButton
                    icon={item.icon}
                    isActive={item.value === meta.value}
                    height={20}
                    onClick={() => {
                      meta.value = item.value;
                      trait.update(`"${meta.value}"`);
                    }}
                    flexGrow={1}
                  />
                ) : (
                  <Button
                    isActive={item.value === meta.value}
                    iconBefore={item.icon}
                    height={20}
                    onClick={() => {
                      meta.value = item.value;
                      trait.update(`"${meta.value}"`);
                    }}
                    flexGrow={1}
                    textAlign="center"
                  >
                    {item.label}
                  </Button>
                )}
              </Tooltip>
            );
          })}
        </div>
      )}
    </>
  );
});

const Icon = ({ source, name, size, color, style }: any) => {
  const Icon: any = (IconSource as any)[source];

  return <Icon name={name} size={size} color={color} style={style} />;
};
