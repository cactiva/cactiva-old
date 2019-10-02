import { Alert, Menu, Pane, Popover, Text } from 'evergreen-ui';
import _ from 'lodash';
import { observer, useObservable } from 'mobx-react-lite';
import React, { useRef } from 'react';
import { SyntaxKind } from '../editor/utility/kinds';
import { ICactivaTraitField } from '../editor/utility/tags';
import kinds from './tags';

export interface ICactivaTraitFieldProps extends ICactivaTraitField {
  editor: any;
  source: any;
  value?: any;
  resetValue: any;
  style?: any;
  convertToCode: any;
  defaultKind: number;
  update: (value: any) => void;
}
export default observer((trait: ICactivaTraitFieldProps) => {
  let kindName = '';
  for (let k in SyntaxKind) {
    const skind = parseInt(SyntaxKind[k]);
    if (skind === trait.kind) {
      kindName = k;
      break;
    }
  }
  const KindField = kinds[kindName];
  if (!KindField) {
    return (
      <Alert
        intent='warning'
        title={`Trait field: ${kindName} not found!`}
        marginBottom={32}
      />
    );
  }

  const fieldRef = useRef(null);
  const fieldStyle = _.get(trait, `options.styles.field`, {});
  const labelStyle = _.get(trait, `options.styles.label`, {});
  const rootStyle = _.get(trait, `options.styles.root`, {});
  const meta = useObservable({
    options: { ...trait.options }
  });
  return (
    <Popover
      position='right'
      content={({ close }) => (
        <Pane>
          <div className={'cactiva-trait-cmenu-heading'}>
            <Text size={300}>{trait.name}</Text>
            <Text size={300}>{kindName}</Text>
          </div>
          <Menu>
            {trait.kind !== SyntaxKind.CactivaCode ? (
              <Menu.Item
                icon='code'
                onSelect={() => {
                  meta.options.open = true;
                  trait.convertToCode();
                  close();
                }}
              >
                Convert to Code
              </Menu.Item>
            ) : (
              <Menu.Item
                icon='code'
                onSelect={() => {
                  meta.options.open = true;
                  close();
                }}
              >
                Open Code Editor
              </Menu.Item> 
            )}
            <Menu.Item
              icon='undo'
              onSelect={() => {
                trait.resetValue();
                close();
              }}
            >
              Revert value
            </Menu.Item>
          </Menu>
        </Pane>
      )}
    >
      {({ toggle, getRef }: any) => {
        if (fieldRef.current) {
          getRef(fieldRef.current);
        }
        return (
          <div
            className='cactiva-trait-field'
            onContextMenu={e => {
              e.preventDefault();
              toggle();
            }}
            style={rootStyle}
          >
            <div className='label' style={labelStyle}>
              <Text>{trait.name}</Text>
            </div>
            <div ref={fieldRef}></div>
            <KindField
              {...trait}
              options={meta.options}
              style={{
                flex: 1,
                height: '20px',
                alignItems: 'stretch',
                ...fieldStyle,
                position: 'relative'
              }}
            />
          </div>
        );
      }}
    </Popover>
  );
});
