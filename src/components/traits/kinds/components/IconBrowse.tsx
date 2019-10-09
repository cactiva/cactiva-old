import React from 'react';
import './IconBrowse.scss';
import { observer, useObservable } from 'mobx-react-lite';
import { Dialog, Icon, IconButton, Text } from 'evergreen-ui';

export default observer(({ value, onChange, isShown, onDismiss }: any) => {
  const meta = useObservable({
    isShown: false,
    source: '',
    filetree: {}
  });
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
        <div className="icon-browser">
          <div className="header">
            <Text>Icons</Text>
          </div>
          <div className="content"></div>
        </div>
      </Dialog>
    </>
  );
});
