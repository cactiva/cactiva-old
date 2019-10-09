import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { ICactivaTraitFieldProps } from '../CactivaTraitField';
import './CallExpression.scss';
import { SelectMenu, IconButton, Tooltip } from 'evergreen-ui';
import ImageBrowse from './components/ImageBrowse';
import IconBrowse from './components/IconBrowse';
export default observer((trait: ICactivaTraitFieldProps) => {
  const meta = useObservable({
    value: trait.value,
    isShown: false
  });

  useEffect(() => {
    meta.value = trait.value;
  }, [trait.value]);
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

      {trait.mode && trait.mode === 'image' && (
        <div
          className={`trait-string-literal`}
          style={{ ...trait.style, flexDirection: 'row', alignItems: 'center' }}
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
              trait.update(`${meta.value}`);
            }}
          />

          <Tooltip content="Browse" position="bottom">
            <IconButton
              icon="folder-open"
              height={24}
              paddingLeft={6}
              paddingRight={6}
              onClick={() => {
                meta.isShown = true;
              }}
            />
          </Tooltip>
          <ImageBrowse
            value={meta.value}
            onChange={(v: any) => {
              meta.value = v;
              trait.update(`${meta.value}`);
            }}
            isShown={meta.isShown}
            onDismiss={(v: any) => (meta.isShown = v)}
          />
        </div>
      )}
    </>
  );
});
