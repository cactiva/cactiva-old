import { ControlledEditor } from '@monaco-editor/react';
import { kindNames } from '@src/components/editor/utility/syntaxkind';
import { Icon, Popover, Text } from 'evergreen-ui';
import _ from 'lodash';
import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect, useRef } from 'react';
import { ICactivaTraitFieldProps } from '../CactivaTraitField';
import './CactivaCode.scss';
import { toJS } from 'mobx';
export default observer((trait: ICactivaTraitFieldProps) => {
  const ref = useRef(null);
  const toggleRef = useRef(null as any);
  const options = _.get(trait, 'options');
  const meta = useObservable({
    value:
      typeof trait.value != 'string'
        ? JSON.stringify(trait.value)
        : trait.value,
    kind: 999
  });
  useEffect(() => {
    if (toggleRef.current && ref.current && options.open) {
      toggleRef.current();
      options.open = false;
    }
  }, [options.open]);
  useEffect(() => {
    const source = _.get(trait.source, `props.${trait.path}`, {});
    meta.kind = _.get(source, 'originalValue.kind') || trait.defaultKind;
  }, [trait.source]);
  return (
    <Popover
      position='right'
      onClose={() => {
        trait.update(meta.value);
      }}
      content={
        <Text
          style={{
            width: '650px',
            height: '450px',
            display: 'block',
            fontSize: '11px',
            backgroundColor: '#202123',
            color: 'white',
            position: 'relative',
            userSelect: 'none'
          }}
        >
          <div
            style={{
              padding: '0px 10px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>{trait.name} =</span>
            <span style={{ opacity: 0.5 }}>{kindNames[meta.kind]}</span>
          </div>
          <ControlledEditor
            theme='dark'
            value={meta.value}
            onChange={(e, value) => (meta.value = value || '')}
            options={{
              minimap: {
                enabled: false
              }
            }}
            width='100%'
            height='100%'
            language='javascript'
          />
        </Text>
      }
    >
      {({ getRef, toggle, isShown }) => {
        if (ref.current) getRef(ref.current);
        toggleRef.current = toggle;
        return (
          <div
            ref={ref}
            onClick={() => {
              toggle();
            }}
            className={`trait-cactiva-code`}
            style={{ ...trait.style, flexDirection: 'row' }}
          >
            <div
              className={`cactiva-trait-input`}
              style={{
                height: '20px',
                padding: '0px 0px',
                justifyContent: 'flex-start',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                cursor: 'pointer',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                flex: 1,
                backgroundColor: isShown ? '#333' : 'white'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'row',
                  marginLeft: '5px'
                }}
              >
                <Icon
                  icon='function'
                  size={14}
                  color={isShown ? '#fff' : '#666'}
                />
                <Text size={300} color={isShown ? '#fff' : '#666'}>
                  Code
                </Text>
              </div>
            </div>
          </div>
        );
      }}
    </Popover>
  );
});
