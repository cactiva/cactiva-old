import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { ICactivaTraitFieldProps } from '../CactivaTraitField';
import './CallExpression.scss';
import { SelectMenu, IconButton } from 'evergreen-ui';
import ImageBrowse from './components/ImageBrowse';
export default observer((trait: ICactivaTraitFieldProps) => {
  const meta = useObservable({
    value: trait.value
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
          <ImageBrowse
            value={meta.value}
            onChange={(v: any) => {
              meta.value = v;
              trait.update(`${meta.value}`);
            }}
          />
        </div>
      )}
    </>
  );
});
