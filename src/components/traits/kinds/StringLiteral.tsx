import { uuid } from "@src/components/editor/utility/elements/tools";
import api from "@src/libs/api";
import { Button, IconButton, Popover, Text, Tooltip } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { SketchPicker } from "react-color";
import { ICactivaTraitFieldProps } from "../CactivaTraitField";
import FontBrowser from "./components/FontBrowser";
import IconsEl from "./components/IconMaps";
import "./StringLiteral.scss";

export default observer((trait: ICactivaTraitFieldProps) => {
  const meta = useObservable({
    value: trait.value,
    isShown: false
  });

  const optionItems = _.get(trait, "options.items", []);
  const update = (e: any) => {
    meta.value = e.target.value;
    trait.update(`"${meta.value}"`);
  };
  useEffect(() => {
    meta.value = trait.value || trait.default;
  }, [trait.value]);

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
            onKeyDown={(e:any) => {
              if (e.which === 13) (e.target as any).blur();
            }}
            placeholder={_.get(trait, "options.fields.name")}
            value={meta.value || ""}
            onChange={(e:any) => {
              meta.value = e.target.value;
            }}
            onFocus={(e:any) => {
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
              value={meta.value}
              onChange={update}
            >
              <option disabled={trait.default} value={""}>
                Select ...
              </option>
              {trait.options.items.map((item: any) => {
                return <OptionEl key={uuid("traitstringoption")} item={item} />;
              })}
            </select>
          </div>
        )}

      {trait.mode === "icon" && <IconsEl trait={trait} meta={meta} />}

      {trait.mode === "color" && <ColorEl trait={trait} meta={meta} />}

      {trait.mode === "radio" && optionItems.length > 0 && (
        <div className="cactiva-trait-radio">
          {optionItems.map((item: any) => {
            return (
              <RadioEl
                key={uuid("traitradio")}
                item={item}
                meta={meta}
                trait={trait}
              />
            );
          })}
        </div>
      )}

      {trait.mode === "font" && <FontsEl trait={trait} meta={meta} />}
    </>
  );
});

const OptionEl = observer((props: any) => {
  const { item } = props;
  return <option value={`${item.value}`}>{item.label}</option>;
});

function textColor(bgColor: string, lightColor: string, darkColor: string) {
  var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor;
}


const ColorEl = observer((props: any) => {
  const { meta, trait } = props;
  const metaColor = useObservable({
    value: meta.value
  });
  const onChange = (v: any) => {
    metaColor.value = v.hex;
    if (v.rgb.a < 1) {
      metaColor.value = `rgba(${Object.values(v.rgb)})`;
    }
    update();
  };
  const update = () => {
    trait.update(`"${metaColor.value}"`);
  };
  return (
    <div className="cactiva-trait-color-picker">
      <div
        className={`trait-string-literal`}
        style={{ ...trait.style, flexDirection: "row" }}
      >
        <input
          className={`cactiva-trait-input`}
          type="text"
          onKeyDown={(e:any) => {
            if (e.which === 13) (e.target as any).blur();
          }}
          value={metaColor.value || ""}
          style={{
            backgroundColor: metaColor.value,
            color: textColor(metaColor.value || "#000", "#fff", "#000")
          }}
          onChange={(e:any) => {
            metaColor.value = e.target.value;
          }}
          onFocus={(e:any) => {
            e.target.select();
          }}
          onBlur={update}
        />
      </div>
      <Popover
        onCloseComplete={update}
        content={<SketchPicker onChange={onChange} color={metaColor.value} />}
      >
        <IconButton icon="helper-management" height={20} boxShadow="0px" />
      </Popover>
    </div>
  );
});

const RadioEl = observer((props: any) => {
  const { item, meta, trait } = props;
  const onClick = () => {
    if (meta.value === item.value) {
      meta.value = undefined;
      trait.update(meta.value);
    } else {
      meta.value = item.value;
      trait.update(`"${meta.value}"`);
    }
  };
  return (
    <Tooltip
      showDelay={1000}
      content={
        <Text color={"white"} fontSize={"10px"} textTransform={"capitalize"}>
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
          onClick={onClick}
          flexGrow={1}
          className={trait.options.className + " " + item.value}
        />
      ) : (
          <Button
            isActive={item.value === meta.value}
            iconBefore={item.icon}
            height={20}
            onClick={onClick}
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
});

const FontsEl = observer((props: any) => {
  const { meta, trait } = props;
  const metaFont = useObservable({
    list: [],
    isShown: false
  });
  const onChange = (v: any) => {
    meta.value = v;
    trait.update(`"${meta.value}"`);
  };
  const onAddFont = (v: any) => {
    metaFont.list = v.list;
    trait.editor.renderfont = v.render;
  };
  const onSelect = (v: any) => {
    meta.value = v.target.value;
    trait.update(`"${meta.value}"`);
  };

  useEffect(() => {
    api.get("assets/font-list").then(res => {
      metaFont.list = res.children;
    });
  }, []);

  return (
    <div className="cactiva-trait-font">
      <select
        className={`cactiva-trait-select`}
        value={meta.value}
        onChange={onSelect}
      >

        <option value={undefined}>
          Select ...
        </option>
        {metaFont.list.map((item: any) => {
          return <FontFile key={uuid("traitfont")} item={item} />;
        })}
      </select>
      <IconButton
        icon="folder-new"
        height={20}
        onClick={(e:any) => {
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
        onChange={onChange}
        onAddFont={onAddFont}
      />
    </div>
  );
});

const FontFile = observer((props: any) => {
  const { item } = props;
  const name = item.name.substr(0, item.name.length - 4);
  return <option value={`${name}`}>{name}</option>;
});
