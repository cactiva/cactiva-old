import React from 'react';
import './Welcome.scss';
import { Icon } from 'evergreen-ui';

export default () => {
  return (
    <div className="welcome-canvas">
      <div className="canvas-left">
        <div className="logo">
          <img src="./logo512.png" />
        </div>
        <div className="title">
          <h1>
            Hello! <br /> Welcome to CACTIVA.
          </h1>
          <h3>
            Cactiva is an application designed to make react apps easily and the
            GUI editor makes it easier to write code and is more fun.
          </h3>
        </div>
      </div>
      <div className="canvas-right">
        <div className="navigation">
          <div className="menu">
            <Icon icon="folder-new" color="#38c7cd" size={40} />
            <div className="title">New app.</div>
          </div>
          <div className="menu">
            <Icon icon="folder-open" color="#38c7cd" size={40} />
            <div className="title">Open app.</div>
          </div>
        </div>
      </div>
      <div className="background">
        <img src="./images/code.png" />
      </div>
    </div>
  );
};
