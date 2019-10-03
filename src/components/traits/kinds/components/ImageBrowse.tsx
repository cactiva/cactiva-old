import { Dialog, IconButton, Pane, Icon, Tooltip } from 'evergreen-ui';
import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import './ImageBrowser.scss';
import api from '@src/libs/api';
import { toJS } from 'mobx';

const deleteFile = (filename: any) => {
  return new Promise(resolve => {
    api.post('assets/delete', { filename }).then(res => {
      resolve(res);
    });
  });
};
export default observer(({ value, onChange }: any) => {
  const meta = useObservable({
    isShown: false,
    source: '',
    filetree: {}
  });
  useEffect(() => {
    value &&
      (meta.source = value
        .replace("require('", '')
        .replace('@src/assets/images/', '')
        .replace("')", ''));
  }, [value]);

  useEffect(() => {
    const load = async () => {
      meta.filetree = await api.get('assets/list');
    };
    load();
  }, []);
  return (
    <>
      <Dialog
        isShown={meta.isShown}
        hasHeader={false}
        hasFooter={false}
        onCloseComplete={() => (meta.isShown = false)}
        preventBodyScrolling
      >
        <div className="canvas">
          <div className="header">
            <div>Media</div>
          </div>
          <div className="content">
            <label className="image image-upload">
              <Icon icon="cloud-upload" size={40} color="#1070ca" />
              Upload File
              <input
                multiple={false}
                type="file"
                accept="image/*"
                onChange={async (e: any) => {
                  const file = e.target.files[0];
                  var formDataToUpload = new FormData();
                  formDataToUpload.append('file', file);
                  await api.post('/assets/upload', formDataToUpload, {
                    headers: {
                      'Content-Type': 'multipart/form-data'
                    }
                  });
                  const res = await api.get('assets/list');
                  meta.filetree = { ...res };
                }}
                style={{ display: 'none' }}
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
                        position: 'relative'
                      }}
                    >
                      <div
                        className={`image ${meta.source === file.name &&
                          'active'}`}
                        onClick={() => {
                          meta.source = file.name;
                          meta.isShown = false;
                          onChange(
                            `require('@src/assets/images/${file.name}')`
                          );
                        }}
                      >
                        <img
                          src={api.url + 'assets/' + file.name}
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
      <Tooltip content="Browse" position="bottom">
        <IconButton
          icon="folder-open"
          height={24}
          paddingLeft={6}
          paddingRight={6}
          onClick={() => {
            meta.isShown = true;
          }}
        />
      </Tooltip>
    </>
  );
});
