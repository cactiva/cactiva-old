import {observer, useObservable} from 'mobx-react-lite';
import React, {useEffect} from 'react';
import {ICactivaTraitFieldProps} from '../CactivaTraitField';
import './StringLiteral.scss';

export default observer((trait: ICactivaTraitFieldProps) => {
  const meta = useObservable({
    value: trait.value,
    clicked: false
  });

  useEffect(() => {
    meta.value = trait.value;
  }, [trait.value]);
  return (
    <>
      <div
        className={`trait-string-literal ${meta.clicked ? 'clicked' : ''}`}
        style={{...trait.style, flexDirection: 'row'}}
      >
        <input
          className={`cactiva-trait-input ${meta.clicked ? 'focus' : ''}`}
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
    </>
  );
});
