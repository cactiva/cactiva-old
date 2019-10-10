import api from "@src/libs/api";
import { Dialog, Icon, IconButton, Text } from "evergreen-ui";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import "./ImageBrowser.scss";

const deleteFile = (filename: any) => {
  return new Promise(resolve => {
    api.post("assets/delete", { filename }).then(res => {
      resolve(res);
    });
  });
};
export default observer(({ value, onChange, isShown, onDismiss }: any) => {
  const meta = useObservable({
    isShown: false,
    source: "",
    filetree: {}
  });
  useEffect(() => {
    value &&
      (meta.source = value
        .replace("require('", "")
        .replace("@src/assets/images/", "")
        .replace("')", ""));
    meta.isShown = isShown;
  }, [value, isShown]);

  useEffect(() => {
    const load = async () => {
      meta.filetree = await api.get("assets/list");
    };
    load();
  }, [meta.isShown]);
  return (
    <>
      <Dialog
        isShown={meta.isShown}
        hasHeader={false}
        hasFooter={false}
        onCloseComplete={() => {
          meta.isShown = false;
          onDismiss && onDismiss(false);
        }}
        preventBodyScrolling
      >
        <div className="image-browser">
          <div className="header">
            <Text>Media</Text>
          </div>
          <div className="content">
            <label
              className="image image-upload"
              onClickCapture={e => {
                e.stopPropagation();
              }}
            >
              <Icon icon="cloud-upload" size={35} color="white" />
              <Text>
                <Icon icon="plus" size={13} color="white" /> Upload File
              </Text>
              <input
                multiple={false}
                type="file"
                accept="image/*"
                onChange={async (e: any) => {
                  const file = e.target.files[0];
                  var formDataToUpload = new FormData();
                  formDataToUpload.append("file", file);
                  await api.post("/assets/upload", formDataToUpload, {
                    headers: {
                      "Content-Type": "multipart/form-data"
                    }
                  });
                  const res = await api.get("assets/list");
                  meta.filetree = { ...res };
                }}
                style={{ display: "none" }}
              />
            </label>
            {!!meta.filetree &&
              ((meta.filetree as any).children || []).map(
                (file: any, idx: number) => {
                  return (
                    <div
                      className="image-canvas"
                      key={idx}
                      style={{
                        position: "relative"
                      }}
                    >
                      <div
                        className={`image ${meta.source === file.name &&
                          "active"}`}
                        onClick={() => {
                          meta.source = file.name;
                          meta.isShown = false;
                          onDismiss && onDismiss(false);
                          onChange(
                            `require('@src/assets/images/${file.name}')`
                          );
                        }}
                      >
                        <img
                          src={api.url + "assets/" + file.name}
                          alt={file.name}
                        />
                      </div>
                      <IconButton
                        className="btn-delete"
                        icon="trash"
                        height={24}
                        paddingLeft={6}
                        paddingRight={6}
                        intent="danger"
                        appearance="primary"
                        onClick={() => {
                          deleteFile(file.name).then((res: any) => {
                            meta.filetree = res;
                          });
                        }}
                      />
                    </div>
                  );
                }
              )}
          </div>
        </div>
      </Dialog>
    </>
  );
});
