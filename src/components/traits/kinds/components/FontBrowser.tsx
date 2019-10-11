import React, { useEffect, useRef } from "react";
import { observer, useObservable } from "mobx-react-lite";
import { Dialog, Text, IconButton, Icon } from "evergreen-ui";
import _ from "lodash";

import "./FontBrowser.scss";
import api from "@src/libs/api";

const deleteFile = (filename: any) => {
  return new Promise(resolve => {
    api.post("assets/delete-font", { filename }).then(res => {
      resolve(res);
    });
  });
};

export default observer(
  ({ value, onChange, isShown, onDismiss, onAddFont }: any) => {
    const meta = useObservable({
      isShown: false,
      list: [],
      value: value
    });
    useEffect(() => {
      meta.value = value;
      meta.isShown = isShown;
    }, [value, isShown]);

    useEffect(() => {
      const load = async () => {
        const filetree = await api.get("assets/font-list");
        meta.list = filetree.children;
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
          <div className="font-browser">
            <div className="header">
              <Text>Fonts</Text>
            </div>
            <div className="content">
              <div className={`item upload`}>
                <label
                  className="label"
                  onClickCapture={e => {
                    e.stopPropagation();
                  }}
                >
                  <Icon icon="cloud-upload" />
                  <span>Upload File</span>
                  <input
                    multiple={false}
                    type="file"
                    accept=".ttf"
                    onChange={async (e: any) => {
                      const file = await e.target.files[0];
                      const name: any = prompt(
                        "Name:",
                        file.name.substr(0, file.name.length - 4)
                      );
                      var formDataToUpload = new FormData();
                      formDataToUpload.append("file", file);
                      formDataToUpload.append("name", name + ".ttf");
                      const newVal = await api.post(
                        "/assets/upload-font",
                        formDataToUpload,
                        {
                          headers: {
                            "Content-Type": "multipart/form-data"
                          }
                        }
                      );
                      meta.value = newVal.filename.substr(
                        0,
                        newVal.filename.length - 4
                      );
                      const filetree = await api.get("assets/font-list");
                      meta.list = filetree.children;
                      onAddFont && onAddFont(true);
                    }}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              {meta.list.map((item: any, idx: number) => {
                const name = item.name.substr(0, item.name.length - 4);
                return (
                  <div
                    className={`item ${name === meta.value ? "active" : ""}`}
                    key={idx}
                  >
                    <div
                      className="label"
                      onClick={() => {
                        meta.value = name;
                        onChange(meta.value);
                        meta.isShown = false;
                        onDismiss && onDismiss(false);
                      }}
                    >
                      {name}
                    </div>
                    <div className="action">
                      <IconButton
                        icon="trash"
                        height={20}
                        intent="danger"
                        onClick={() => {
                          deleteFile(item.name).then((res: any) => {
                            meta.list = res.children;
                          });
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Dialog>
      </>
    );
  }
);
