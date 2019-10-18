import { IconButton, Tooltip } from "evergreen-ui";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { ICactivaTraitFieldProps } from "../CactivaTraitField";
import "./CallExpression.scss";
import ImageBrowse from "./components/ImageBrowse";
export default observer((trait: ICactivaTraitFieldProps) => {
  const meta = useObservable({
    value: trait.value,
    isShown: false
  });
  const update = (v: any) => {
    trait.update(`${meta.value}`);
  };
  const onClickImage = () => {
    meta.isShown = true;
  };
  const onChange = (e: any) => {
    meta.value = e.target.value;
  };
  const onFocus = (e: any) => {
    e.target.select();
  };
  const onChangeImage = (v: any) => {
    meta.value = v;
    trait.update(`${meta.value}`);
  };
  const onDismissImage = (v: any) => (meta.isShown = v);

  useEffect(() => {
    meta.value = trait.value || trait.default;
  }, [trait.value]);
  return (
    <>
      {!trait.mode && (
        <div
          className={`trait-string-literal`}
          style={{ ...trait.style, flexDirection: "row" }}
        >
          <input
            className={`cactiva-trait-input`}
            type="text"
            value={meta.value || ""}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={update}
          />
        </div>
      )}

      {trait.mode && trait.mode === "image" && (
        <div
          className={`trait-string-literal`}
          style={{ ...trait.style, flexDirection: "row", alignItems: "center" }}
        >
          <input
            className={`cactiva-trait-input`}
            type="text"
            value={meta.value || ""}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={update}
          />

          <Tooltip content="Browse" position="bottom">
            <IconButton
              icon="folder-open"
              height={24}
              paddingLeft={6}
              paddingRight={6}
              onClick={onClickImage}
            />
          </Tooltip>
          <ImageBrowse
            value={meta.value}
            onChange={onChangeImage}
            isShown={meta.isShown}
            onDismiss={onDismissImage}
          />
        </div>
      )}
    </>
  );
});
