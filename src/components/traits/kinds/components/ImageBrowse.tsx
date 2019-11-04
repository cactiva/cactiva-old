import api from "@src/libs/api";
import { Dialog, Icon, IconButton, Text } from "evergreen-ui";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import "./ImageBrowser.scss";
import { uuid } from "@src/components/editor/utility/elements/tools";

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
  const onChangeUpload = async (e: any) => {
    const file = e.target.files[0];
    var formDataToUpload = new FormData();
    formDataToUpload.append("file", file);
    await api.post("/assets/upload", formDataToUpload, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    loadList();
  };
  const onCloseComplete = () => {
    meta.isShown = false;
    onDismiss && onDismiss(false);
  };
  const loadList = () => {
    api.get("assets/list").then(res => {
      meta.filetree = res;
    });
  };
  useEffect(() => {
    if (Array.isArray(value) && value.length > 0) {
      meta.source = value[0]
        .replace("require('", "")
        .replace("@src/assets/images/", "")
        .replace("')", "");
      meta.isShown = isShown;
    }
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
        onCloseComplete={onCloseComplete}
        preventBodyScrolling
      >
        <div className="image-browser">
          <div className="header">
            <Text>Media</Text>
          </div>
          <div className="content">
            <label
              className="image image-upload"
              onClickCapture={(e:any)=> {
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
                onChange={onChangeUpload}
                style={{ display: "none" }}
              />
            </label>
            {!!meta.filetree &&
              ((meta.filetree as any).children || []).map((file: any) => {
                return (
                  <FileEl
                    key={uuid("fileimage")}
                    file={file}
                    meta={meta}
                    onDismiss={onDismiss}
                    onChange={onChange}
                  />
                );
              })}
          </div>
        </div>
      </Dialog>
    </>
  );
});

const FileEl = observer((props: any) => {
  const { meta, file, onDismiss, onChange } = props;
  const onClickFile = () => {
    meta.source = file.name;
    meta.isShown = false;
    onDismiss && onDismiss(false);
    onChange(`@src/assets/images/${file.name}`);
  };
  const onClickDelete = () => {
    deleteFile(file.name).then((res: any) => {
      meta.filetree = res;
    });
  };
  return (
    <div
      className="image-canvas"
      style={{
        position: "relative"
      }}
    >
      <div
        className={`image ${meta.source === file.name && "active"}`}
        onClick={onClickFile}
      >
        <img src={api.url + "assets/" + file.name} alt={file.name} />
      </div>
      <IconButton
        className="btn-delete"
        icon="trash"
        height={24}
        paddingLeft={6}
        paddingRight={6}
        intent="danger"
        appearance="primary"
        onClick={onClickDelete}
      />
    </div>
  );
});
