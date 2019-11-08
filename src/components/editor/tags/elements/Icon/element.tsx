import * as IconSource from 'react-web-vector-icons';
import { observer } from 'mobx-react-lite';
import React from 'react';
import CactivaDraggable from '../../../CactivaDraggable';
import CactivaDropChild from '../../../CactivaDroppable';
import CactivaSelectable from '../../../CactivaSelectable';
import { parseProps, parseStyle } from '../../../utility/parser/parser';

export default observer((props: any) => {
  const cactiva = props._cactiva;
  const tagProps = parseProps(props);
  const style = parseStyle(props.style, cactiva);
  return (
    <CactivaDropChild cactiva={cactiva} canDropOver={false}>
      <CactivaDraggable cactiva={cactiva}>
        <CactivaSelectable cactiva={cactiva} style={style}>
          <Icon {...tagProps} style={style} />
        </CactivaSelectable>
      </CactivaDraggable>
    </CactivaDropChild>
  );
});

interface IconProps {
  source:
  | 'AntDesign'
  | 'Entypo'
  | 'EvilIcons'
  | 'Feather'
  | 'FontAwesome'
  | 'Foundation'
  | 'Ionicons'
  | 'MaterialCommunityIcons'
  | 'MaterialIcons'
  | 'Octicons'
  | 'SimpleLineIcons'
  | 'Zocial';
  name: string;
  size?: number;
  color?: string;
  style?: any;
}
const Icon = ({ source, name, size, color, style }: IconProps) => {
  const Icon: any = (IconSource as any)[source];
  if (!Icon) return null;

  return <Icon name={name} size={size} color={color} style={style} />;
};
