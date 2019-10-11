import { parseValue } from "@src/components/editor/utility/parser/parser";
import {
  Button,
  IconButton,
  Pane,
  Popover,
  Text,
  Tooltip,
  Icon
} from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import {
  SketchPicker,
  PhotoshopPicker,
  MaterialPicker,
  ChromePicker
} from "react-color";
import * as IconSource from "react-web-vector-icons";
import { ICactivaTraitFieldProps } from "../CactivaTraitField";
import IconMaps from "./components/IconMaps";
import "./StringLiteral.scss";
import api from "@src/libs/api";
import { toJS } from "mobx";
import FontBrowser from "./components/FontBrowser";

const Icons = IconMaps();
export default observer((trait: ICactivaTraitFieldProps) => {
  const meta = useObservable({
    value: trait.value,
    isShown: false
  });

  const metaIcon = useObservable({
    source: "Entypo",
    search: "",
    list: Icons["Entypo"]
  });

  const metaFont = useObservable({
    list: [],
    isShown: false
  });

  const optionItems = _.get(trait, "options.items", []);
  useEffect(() => {
    meta.value = trait.value;
  }, [trait.value]);

  useEffect(() => {
    if (_.get(trait, "mode") === "icon") {
      metaIcon.source = parseValue(trait.source.props.source);
      metaIcon.list = Icons[metaIcon.source].filter((x: string) =>
        x.toLowerCase().includes(metaIcon.search)
      );
    }
  }, [trait]);
  useEffect(() => {
    if (_.get(trait, "mode") === "font") {
      const load = async () => {
        const filetree = await api.get("assets/font-list");
        metaFont.list = filetree.children;
      };
      load();
    }
  }, [trait]);
  return (
    <>
      {!trait.mode && (
        <div
          className={`trait-string-literal ${_.get(
            trait,
            "options.className"
          )}`}
          style={{ ...trait.style, flexDirection: "row" }}
        >
          <input
            className={`cactiva-trait-input`}
            type="text"
            placeholder={_.get(trait, "options.fields.name")}
            value={meta.value || ""}
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

      {trait.mode &&
        trait.mode === "select" &&
        trait.options &&
        trait.options.items && (
          <div
            className={`trait-string-literal`}
            style={{ ...trait.style, flexDirection: "row" }}
          >
            <select
              className={`cactiva-trait-select`}
              value={meta.value || trait.default}
              onChange={e => {
                meta.value = e.target.value;
                trait.update(`"${meta.value}"`);
              }}
            >
              <option disabled={meta.value} value={""}>
                Select ...
              </option>
              {trait.options.items.map((item: any, i: number) => {
                return (
                  <option key={i} value={`${item.value}`}>
                    {item.label}
                  </option>
                );
              })}
            </select>
          </div>
        )}

      {trait.mode === "icon" && (
        <div
          className={`trait-string-literal cactiva-trait-icon`}
          style={{ ...trait.style, flexDirection: "row", alignItems: "center" }}
        >
          <div className="icon-wrapper">
            <div className="toolbar">
              <div className={`icon-selected`}>
                <CustomIcon
                  source={metaIcon.source}
                  name={meta.value}
                  size={20}
                />
              </div>
              <input
                className={`cactiva-trait-input input`}
                placeholder="Search"
                type="text"
                value={metaIcon.search}
                onChange={e => {
                  let v = e.target.value.toLowerCase();
                  metaIcon.search = v;
                  metaIcon.list = Icons[metaIcon.source].filter((x: string) =>
                    x.toLowerCase().includes(v)
                  );
                }}
                onFocus={e => {
                  e.target.select();
                }}
              />
            </div>
            <div className={`list`}>
              {metaIcon.list.map((name: any, idx: number) => {
                return (
                  <div
                    key={idx}
                    className={`icon ${meta.value === name ? "active" : ""}`}
                    onClick={() => {
                      trait.update(`"${name}"`);
                    }}
                  >
                    <CustomIcon
                      source={metaIcon.source}
                      name={name}
                      size={18}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {trait.mode === "color" && (
        <div className="cactiva-trait-color-picker">
          <div
            className={`trait-string-literal`}
            style={{ ...trait.style, flexDirection: "row" }}
          >
            <input
              className={`cactiva-trait-input`}
              type="text"
              value={meta.value || ""}
              style={{
                backgroundColor: meta.value,
                color: textColor(meta.value || "#fff", "#fff", "#000")
              }}
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
          <Popover
            content={
              <SketchPicker
                onChangeComplete={(v: any) => {
                  meta.value = v.hex;
                  if (v.rgb.a < 1) {
                    meta.value = `rgba(${Object.values(v.rgb)})`;
                  }
                  trait.update(`"${meta.value}"`);
                }}
                color={meta.value}
              />
            }
          >
            <IconButton icon="helper-management" height={20} boxShadow="0px" />
          </Popover>
        </div>
      )}

      {trait.mode === "radio" && optionItems.length > 0 && (
        <div className="cactiva-trait-radio">
          {optionItems.map((item: any, idx: number) => {
            return (
              <Tooltip
                key={idx}
                showDelay={1000}
                content={
                  <Text
                    color={"white"}
                    fontSize={"10px"}
                    textTransform={"capitalize"}
                  >
                    {item.label}
                  </Text>
                }
                position="top"
              >
                {item.mode === "icon" ? (
                  <IconButton
                    icon={item.icon}
                    isActive={item.value === meta.value}
                    height={20}
                    onClick={() => {
                      meta.value = item.value;
                      trait.update(`"${meta.value}"`);
                    }}
                    flexGrow={1}
                  />
                ) : (
                  <Button
                    isActive={item.value === meta.value}
                    iconBefore={item.icon}
                    height={20}
                    onClick={() => {
                      meta.value = item.value;
                      trait.update(`"${meta.value}"`);
                    }}
                    flexGrow={1}
                    fontSize={10}
                    padding={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {item.label}
                  </Button>
                )}
              </Tooltip>
            );
          })}
        </div>
      )}

      {trait.mode === "font" && (
        <div className="cactiva-trait-font">
          <select
            className={`cactiva-trait-select`}
            value={meta.value || trait.default}
            onChange={e => {
              meta.value = e.target.value;
              trait.update(`"${meta.value}"`);
            }}
          >
            <option disabled={meta.value} value={""}>
              Select ...
            </option>
            {metaFont.list.map((item: any, i: number) => {
              const name = item.name.substr(0, item.name.length - 4);
              return (
                <option key={i} value={`${name}`}>
                  {name}
                </option>
              );
            })}
          </select>
          <IconButton
            icon="folder-new"
            height={20}
            onClick={e => {
              e.stopPropagation();
              metaFont.isShown = true;
            }}
          />
          <FontBrowser
            value={meta.value}
            isShown={metaFont.isShown}
            onDismiss={(v: any) => {
              metaFont.isShown = v;
            }}
            onChange={(v: any) => {
              meta.value = v;
              trait.update(`"${meta.value}"`);
            }}
          />
        </div>
      )}
    </>
  );
});

const CustomIcon = ({ source, name, size, color, style }: any) => {
  const Icon: any = (IconSource as any)[source];

  return <Icon name={name} size={size} color={color} style={style} />;
};

function textColor(bgColor: string, lightColor: string, darkColor: string) {
  var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor;
}
