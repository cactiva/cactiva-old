import {
  Button,
  Dialog,
  Icon,
  Spinner,
  TextInputField,
  Pane
} from 'evergreen-ui';
import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import './Welcome.scss';

export default observer(({ editor }: any) => {
  // if (editor.status === 'loading') {
  return <Loading />;
  // }
  return (
    <div className='welcome-wrapper'>
      <div className='welcome-canvas'>
        <div className='canvas-left'>
          <div className='logo'>
            <div className='title'>
              <img src='./logo512.png' />
              <label>CACTIVA</label>
            </div>
            <div className='subtitle'>
              <label>
                Hello! <br /> Welcome to CACTIVA.
              </label>
              <p>
                Cactiva is an application designed to make react apps easily and
                the GUI editor makes it easier to write code and is more fun.
              </p>
            </div>
          </div>

          <div className='background'>
            <img src='./images/code.png' />
          </div>
        </div>
        <div className='canvas-right'>
          <div className='navigation'>
            <label>Recent</label>
            <div className='menu'>
              <Icon icon='control' color='#38c7cd' size={20} />
              <div className='title'>
                <label>sfa-knm</label>
                <p>/app/sfa-knm</p>
              </div>
            </div>
            <div className='menu'>
              <Icon icon='control' color='#38c7cd' size={20} />
              <div className='title'>
                <label>pelindo</label>
                <p>/app/pelindo</p>
              </div>
            </div>
          </div>
          <div className='action'>
            <NewProject />
            <div className='divider' />
            <Button iconBefore='folder-open'>Open...</Button>
          </div>
        </div>
      </div>
    </div>
  );
});

const NewProject = observer(() => {
  const meta = useObservable({
    isShown: false,
    loading: false,
    isInvalid: false,
    projectName: ''
  });
  return (
    <>
      <Dialog
        isShown={meta.isShown}
        hasHeader={false}
        hasFooter={false}
        onCloseComplete={() => (meta.isShown = false)}
        preventBodyScrolling
      >
        <div className='modal-wrapper'>
          <div className='modal-create'>
            <TextInputField
              label='Project Name'
              required
              flexDirection='column'
              flex={1}
              value={meta.projectName}
              onChange={(e: any) => {
                meta.projectName = e.nativeEvent.target.value;
              }}
              isInvalid={meta.isInvalid}
              validationMessage='This field is required'
            />
            <Button
              appearance='primary'
              onClick={() => {
                meta.isInvalid = false;
                if (!meta.projectName) meta.isInvalid = true;
                else {
                  meta.loading = true;
                  setTimeout(() => {
                    meta.isShown = false;
                    meta.loading = false;
                    meta.projectName = '';
                  }, 5000);
                }
              }}
              iconBefore='folder-new'
            >
              Create
            </Button>
          </div>

          {meta.loading && (
            <div className='loading-content'>
              <div className='loading-message'>
                <Icon icon='tick-circle' color='success' size={24} />
                <label>Creating folder...</label>
              </div>
              <div className='loading-message'>
                <Spinner size={24} display='block' />
                <label>Setup project...</label>
              </div>
              <div className='loading-message'>
                <Spinner size={24} display='block' />
                <label> Opening CACTIVA...</label>
              </div>
            </div>
          )}
        </div>
      </Dialog>
      <Button
        appearance='primary'
        onClick={() => {
          meta.isShown = true;
        }}
        iconBefore='folder-new'
      >
        New Project...
      </Button>
    </>
  );
});

const Loading = () => {
  return (
    <div className='wrapper'>
      <div className='loading-screen'>
        <Spinner size={32} display='block' />
        <label>Loading...</label>
      </div>
    </div>
  );
};
