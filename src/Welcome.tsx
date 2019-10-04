import React from 'react';
import './Welcome.scss';
import { Icon, Button } from 'evergreen-ui';

export default () => {
  return (
    <div className="wrapper">
      <div className="welcome-canvas">
        <div className="canvas-left">
          <div className="logo">
            <div className="title">
              <img src="./logo512.png" />
              <label>CACTIVA</label>
            </div>
            <div className="subtitle">
              <label>
                Hello! <br /> Welcome to CACTIVA.
              </label>
              <p>
                Cactiva is an application designed to make react apps easily and
                the GUI editor makes it easier to write code and is more fun.
              </p>
            </div>
          </div>

          <div className="background">
            <img src="./images/code.png" />
          </div>
        </div>
        <div className="canvas-right">
          <div className="navigation">
            <label>Recent</label>
            <div className="menu">
              <Icon icon="control" color="#38c7cd" size={20} />
              <div className="title">
                <label>sfa-knm</label>
                <p>/app/sfa-knm</p>
              </div>
            </div>
            <div className="menu">
              <Icon icon="control" color="#38c7cd" size={20} />
              <div className="title">
                <label>pelindo</label>
                <p>/app/pelindo</p>
              </div>
            </div>
          </div>
          <div className="action">
            <Button appearance="primary">New Project...</Button>
            <div />
            <Button>Open...</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
