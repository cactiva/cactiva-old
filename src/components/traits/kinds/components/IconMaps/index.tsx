import { parseValue } from "@src/components/editor/utility/parser/parser";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import * as IconSource from "react-web-vector-icons";
import VirtualList from 'react-tiny-virtual-list';
import { uuid } from "@src/components/editor/utility/elements/tools";
import _ from "lodash";

const dataIcons: any = {
  AntDesign: require("./AntDesign.json"),
  Entypo: require("./Entypo.json"),
  EvilIcons: require("./EvilIcons.json"),
  Feather: require("./Feather.json"),
  FontAwesome: require("./FontAwesome.json"),
  // FontAwesome5: require('./FontAwesome5Free.json'),
  Foundation: require("./Foundation.json"),
  Ionicons: require("./Ionicons.json"),
  MaterialCommunityIcons: require("./MaterialCommunityIcons.json"),
  MaterialIcons: require("./MaterialIcons.json"),
  Octicons: require("./Octicons.json"),
  SimpleLineIcons: require("./SimpleLineIcons.json"),
  Zocial: require("./Zocial.json")
};
export const IconMaps = () => {
  const iconMaps: any = {};
  Object.keys(dataIcons).forEach((k: any) => {
    iconMaps[k] = Object.keys(dataIcons[k]);
  });
  return iconMaps;
};

const Icons = IconMaps();

export default observer((props: any) => {
  const { trait, meta } = props;
  const onChange = (e: any) => {
    let v = e.target.value.toLowerCase();
    metaIcon.search = v;
    metaIcon.list = Icons[metaIcon.source].filter((x: string) =>
      x.toLowerCase().includes(v)
    );
  };

  const metaIcon = useObservable({
    source: "Entypo",
    search: "",
    list: Icons["Entypo"]
  });

  useEffect(() => {
    metaIcon.source = parseValue(trait.source.props.source);
    metaIcon.list = Icons[metaIcon.source].filter((x: string) =>
      x.toLowerCase().includes(metaIcon.search)
    );
  }, []);

  const chunkedList = _.chunk(metaIcon.list, 4);

  return (
    <div
      className={`trait-string-literal cactiva-trait-icon`}
      style={{ ...trait.style, flexDirection: "row", alignItems: "center" }}
    >
      <div className="icon-wrapper">
        <div className="toolbar">
          <div className={`icon-selected`}>
            <CustomIcon source={metaIcon.source} name={meta.value} size={20} />
          </div>
          <input
            className={`cactiva-trait-input input`}
            placeholder="Search"
            type="text"
            value={metaIcon.search}
            onChange={onChange}
            onFocus={(e:any) => {
              e.target.select();
            }}
          />
        </div>
        <div className={`list`}>
          <VirtualList
            width='100%'
            height={100}
            itemCount={chunkedList.length}
            itemSize={30} // Also supports variable heights (array or function getter)
            renderItem={({ index, style }) =>
              <div key={index} style={{ ...style, display: 'flex' }}>
                {chunkedList[index].map(item => <IconEl
                  key={uuid("traiticon")}
                  name={item}
                  meta={meta}
                  trait={trait}
                  metaIcon={metaIcon}
                />)}
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
});

const CustomIcon = ({ source, name, size, color, style }: any) => {
  const Icon: any = (IconSource as any)[source];

  return <Icon name={name} size={size} color={color} style={style} />;
};

const IconEl = observer((props: any) => {
  const { trait, meta, metaIcon, name } = props;
  const onClick = () => {
    trait.update(`"${name}"`);
  };
  return (
    <div
      className={`icon ${meta.value === name ? "active" : ""}`}
      onClick={onClick}
    >
      <CustomIcon source={metaIcon.source} name={name} size={18} />
    </div>
  );
});
