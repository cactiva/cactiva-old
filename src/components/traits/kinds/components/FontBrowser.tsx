import React, { useEffect, useRef } from "react";
import { observer, useObservable } from "mobx-react-lite";
import { Dialog, Text, IconButton, Icon } from "evergreen-ui";
import _ from "lodash";

import "./FontBrowser.scss";
import api from "@src/libs/api";
import { uuid } from "@src/components/editor/utility/elements/tools";

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
    const onChangeUpload = async (e: any) => {
      const file = await e.target.files[0];
      const name: any = prompt(
        'Name it as "Global" to set the font to default',
        file.name.substr(0, file.name.length - 4)
      );
      var formDataToUpload = new FormData();
      formDataToUpload.append("file", file);
      formDataToUpload.append("name", name + ".ttf");
      const newVal = await api.post("/assets/upload-font", formDataToUpload, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      loadList();
      onAddFont &&
        onAddFont({
          list: meta.list,
          render: true
        });
      meta.value = newVal.filename.substr(0, newVal.filename.length - 4);
      onChange(meta.value);
    };
    const onCloseDialog = () => {
      meta.isShown = false;
      onDismiss && onDismiss(false);
    };
    const loadList = () => {
      api.get("assets/font-list").then(res => {
        meta.list = res.children;
      });
    };
    useEffect(() => {
      meta.value = value;
      meta.isShown = isShown;
    }, [value, isShown]);

    useEffect(() => {
      loadList();
    }, [meta.isShown]);
    return (
      <>
        <Dialog
          isShown={meta.isShown}
          hasHeader={false}
          hasFooter={false}
          onCloseComplete={onCloseDialog}
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
                  onClickCapture={(e:any) => {
                    e.stopPropagation();
                  }}
                >
                  <Icon icon="cloud-upload" />
                  <span>Upload File</span>
                  <input
                    multiple={false}
                    type="file"
                    accept=".ttf"
                    onChange={onChangeUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              {meta.list.map((item: any, idx: number) => {
                return (
                  <FileEl
                    key={uuid("filefont")}
                    item={item}
                    meta={meta}
                    onChange={onChange}
                    onDismiss={onDismiss}
                  />
                );
              })}
            </div>
          </div>
        </Dialog>
      </>
    );
  }
);

const FileEl = observer((props: any) => {
  const { item, meta, onChange, onDismiss } = props;
  const name = item.name.substr(0, item.name.length - 4);
  const onClickDelete = () => {
    deleteFile(item.name).then((res: any) => {
      meta.list = res.children;
    });
  };
  const onClick = () => {
    meta.value = name;
    onChange(meta.value);
    meta.isShown = false;
    onDismiss && onDismiss(false);
  };
  return (
    <div className={`item ${name === meta.value ? "active" : ""}`}>
      <div className="label" onClick={onClick}>
        {name}
      </div>
      <div className="action">
        <IconButton
          icon="trash"
          height={20}
          intent="danger"
          onClick={onClickDelete}
        />
      </div>
    </div>
  );
});
