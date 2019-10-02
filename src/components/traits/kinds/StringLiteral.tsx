import {observer, useObservable} from 'mobx-react-lite';
import React, {useEffect} from 'react';
import {ICactivaTraitFieldProps} from '../CactivaTraitField';
import './StringLiteral.scss';

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
          style={{...trait.style, flexDirection: 'row'}}
        >
          <input
            className={`cactiva-trait-input`}
            type='text'
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

      {trait.mode && trait.mode === "select" && trait.options && trait.options.items && (
        <div
          className={`trait-string-literal`}
          style={{...trait.style, flexDirection: 'row'}}
        >
          <select className={`cactiva-trait-select`} value={meta.value} onChange={(e) => {
            meta.value = e.target.value;
            trait.update(`"${meta.value}"`);
          }}>
            <option disabled={meta.value} value={""}>Select ...</option>
            {trait.options.items.map((item: any, i: number) => {
              return <option key={i} value={`${item.value}`}>{item.label}</option>
            })}
          </select>
        </div>
      )}
    </>
  );
});
