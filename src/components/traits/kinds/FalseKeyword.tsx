import {observer} from 'mobx-react-lite';
import React from 'react';
import {ICactivaTraitFieldProps} from '../CactivaTraitField';
import './FalseKeyword.scss';
import {SyntaxKind} from "@src/components/editor/utility/kinds";

export default observer((trait: ICactivaTraitFieldProps) => {
  return (
    <>
      <div
        className={`trait-false-keyword`}
        style={{...trait.style, flexDirection: 'row'}}
      >
        <input className="cactiva-trait-checkbox" type="checkbox" defaultChecked={false} onClick={() => {
          trait.update(undefined, SyntaxKind.TrueKeyword);
        }}/>
      </div>
    </>
  );
});
