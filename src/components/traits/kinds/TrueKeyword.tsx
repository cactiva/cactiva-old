import {observer} from 'mobx-react-lite';
import React from 'react';
import {ICactivaTraitFieldProps} from '../CactivaTraitField';
import './TrueKeyword.scss';
import {SyntaxKind} from "@src/components/editor/utility/kinds";

export default observer((trait: ICactivaTraitFieldProps) => {
  return (
    <>
      <div
        className={`trait-true-keyword`}
        style={{...trait.style, flexDirection: 'row'}}
      >
        <input className="cactiva-trait-checkbox" type="checkbox" defaultChecked={true} onClick={() => {
          trait.update(undefined, SyntaxKind.FalseKeyword);
        }}/>
      </div>
    </>
  );
});
