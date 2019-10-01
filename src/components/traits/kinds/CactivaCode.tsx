import React from 'react';
import { observer } from 'mobx-react-lite';
import { Text, Icon } from 'evergreen-ui';
import { ICactivaTraitFieldProps } from '../CactivaTraitField';
import './CactivaCode.scss';

export default observer((trait: ICactivaTraitFieldProps) => {
  return (
    <div
      className={`trait-cactiva-code`}
      style={{ ...trait.style, flexDirection: 'row' }}
    >
      <div
        className={`cactiva-trait-input`}
        style={{
          height: '20px',
          padding: '0px 5px',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          border: 0,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          color: '#fff',
          flex: 1,
          backgroundColor: '#999'
        }}
      >
        <Icon icon='code' size={25} color='#fff' />
        <Text size={300} color='#fff'>
          {trait.name}
        </Text>
      </div>
    </div>
  );
});
