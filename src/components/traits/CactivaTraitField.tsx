import { Alert, Menu, Pane, Popover, Text, Tooltip } from 'evergreen-ui';
import _ from 'lodash';
import { observer, useObservable } from 'mobx-react-lite';
import React, { useRef } from 'react';
import { ICactivaTraitField } from '../editor/utility/classes';
import { kindNames } from '../editor/utility/kinds';
import { SyntaxKind } from '../editor/utility/syntaxkinds';
import kinds from './tags';

export interface ICactivaTraitFieldProps extends ICactivaTraitField {
  editor: any;
  source: any;
  value?: any;
  resetValue: any;
  style?: any;
  mode?: string | 'select' & undefined;
  convertToCode: any;
  defaultKind: number;
  update: (value: any, updatedKind?: SyntaxKind) => void;
}
export default observer((trait: ICactivaTraitFieldProps) => {
  let kindName = kindNames[trait.kind];
  const KindField = kinds[kindName];

  const fieldRef = useRef(null);
  const fieldStyle = _.get(trait, `options.styles.field`, {});
  const labelStyle = _.get(trait, `options.styles.label`, {});
  const rootStyle = _.get(trait, `options.styles.root`, {});
  const fieldName = _.get(trait, `options.fields.name`, null);

  if (!KindField) {
    return (
      <Alert
        padding={10}
        ref={fieldRef}
        intent="warning"
        title={`Trait field error: ${kindName} not found!`}
      />
    );
  }
  return (
    <Popover
      position="right"
      content={({ close }) => (
        <Pane>
          <div className={'cactiva-trait-cmenu-heading'}>
            <Text size={300}>{trait.name}</Text>
            <Text size={300}>{kindName}</Text>
          </div>
          <Menu>
            {trait.kind !== SyntaxKind.CactivaCode ? (
              <Menu.Item
                icon="code"
                onSelect={() => {
                  trait.options.open = true;
                  trait.convertToCode();
                  close();
                }}
              >
                Convert to Code
              </Menu.Item>
            ) : (
              <Menu.Item
                icon="code"
                onSelect={() => {
                  trait.options.open = true;
                  close();
                }}
              >
                Open Code Editor
              </Menu.Item>
            )}
            <Menu.Item
              icon="undo"
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
          <>
            {!!trait.divider && (
              <div className="cactiva-trait-field-divider">
                <span>{trait.divider}</span>
                <div className="line" />
              </div>
            )}
            <div
              className="cactiva-trait-field"
              onContextMenu={e => {
                e.preventDefault();
                toggle();
              }}
              style={rootStyle}
            >
              {trait.label !== false && (
                <div className="label" style={labelStyle}>
                  <Tooltip
                    showDelay={500}
                    content={
                      <Text
                        color={'white'}
                        fontSize={'10px'}
                        textTransform={'capitalize'}
                      >
                        {trait.name}
                      </Text>
                    }
                    position="top"
                  >
                    <Text>{trait.name}</Text>
                  </Tooltip>
                </div>
              )}
              <div ref={fieldRef} />
              <Tooltip
                showDelay={300}
                position="top"
                content={
                  <Text
                    color={'white'}
                    fontSize={'10px'}
                    textTransform={'capitalize'}
                  >
                    {fieldName}
                  </Text>
                }
                isShown={!fieldName ? false : undefined}
              >
                <Pane style={{ flex: 1 }}>
                  <KindField
                    {...trait}
                    options={trait.options}
                    style={{
                      flex: 1,
                      height: '20px',
                      alignItems: 'stretch',
                      ...fieldStyle,
                      position: 'relative'
                    }}
                  />
                </Pane>
              </Tooltip>
            </div>
          </>
        );
      }}
    </Popover>
  );
});
