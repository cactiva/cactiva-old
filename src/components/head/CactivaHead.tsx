import React from "react";
import { observer } from "mobx-react-lite";
import "./CactivaHead.scss";
import { Text, Spinner, Icon } from "evergreen-ui";

export default observer(({ editor }: any) => {
  const current = editor.current;
  const loadingText = ["loading", "saving"];
  const path =
    (current && current.path.substr(5, current.path.length - 9)) || "";
  return (
    <div className="cactiva-head">
      <div className="left"></div>
      <div className="center">
        <Text
          style={{
            fontSize: "10px",
            fontWeight: 500,
            textTransform: "capitalize",
            color: "#888",
            display: "flex",
            alignItems: "center"
          }}
        >
          {loadingText.indexOf(editor.status) >= 0 && (
            <Spinner size={12} marginLeft={"-2px"} marginRight={"3px"} />
          )}
          {editor.status === "ready" && (
            <div style={{ margin: "-5px 3px 0px -2px", height: 12, width: 12 }}>
              <Icon icon="tick-circle" size={10} color="#999" />
            </div>
          )}
          {editor.status}
          {loadingText.indexOf(editor.status) >= 0 && "…"}
        </Text>
        {current && (
          <Text style={{ fontSize: "8px", color: "#aaa" }}>
            {path.split("/").pop()}
          </Text>
        )}
      </div>
      <div className="right"></div>
    </div>
  );
});
