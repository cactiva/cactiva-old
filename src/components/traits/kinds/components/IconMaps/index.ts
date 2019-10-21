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
export default () => {
  const iconMaps: any = {};
  Object.keys(dataIcons).forEach((k: any) => {
    iconMaps[k] = Object.keys(dataIcons[k]);
  });
  return iconMaps;
};
