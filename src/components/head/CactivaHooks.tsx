import React, { useRef } from "react";
import { Popover, Menu } from "evergreen-ui";
import { observer } from "mobx-react-lite";
import editor from "@src/store/editor";
import { toJS } from "mobx";

export default observer(({ children }: any) => {
  const toggleRef = useRef(null as any);
  const toggle = toggleRef.current;

  if (editor.current) {
    console.log(toJS(editor.current.hooks));
  }

  return (
    <Popover
      content={
        <div
          className="ctree-menu"
          onSelect={() => {
            toggle();
          }}
        >
          <Menu>
            <Menu.Item icon="new-text-box">New Component</Menu.Item>
          </Menu>
        </div>
      }
    >
      {({ toggle, getRef, isShown }: any) => {
        toggleRef.current = toggle;
        return (
          <>
            {children(getRef, toggle)}
            {isShown && (
              <div
                onClick={() => {
                  toggle();
                }}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  zIndex: 11
                }}
              ></div>
            )}
          </>
        );
      }}
    </Popover>
  );
});
