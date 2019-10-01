import { Text, Alert } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { SyntaxKind } from '../editor/utility/syntaxkind';
import { ICactivaTraitField } from '../editor/utility/tags';
import kinds from './kinds';

export interface ICactivaTraitFieldProps extends ICactivaTraitField {
  editor: any;
  path: string[];
  source: any;
  value?: any;
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
  return (
    <div className='cactiva-trait-field'>
      <div className='label'>
        <Text>{trait.name}</Text>
      </div>
      <KindField {...trait} />
    </div>
  );
});
