/**
 * Server file for ExpressJS
 *
 * created by Sean Maxwell April 14, 2019
 */

import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as controllers from './controllers';

import { Server } from '@overnightjs/core'; 
import { Logger } from '@overnightjs/logger';
import * as express from 'express';
import { execPath } from './config';

class MainServer extends Server {
  private readonly SERVER_STARTED = `Cactiva: `;

  constructor() {
    super(true);
    this.app.use(bodyParser.json());
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.setupControllers();
  }

  private setupControllers(): void {
    const ctlrInstances = [];
    for (const name in controllers) {
      if (controllers.hasOwnProperty(name)) {
        const controller = (controllers as any)[name];
        ctlrInstances.push(new controller());
      }
    }
    super.addControllers(ctlrInstances);
  }

  public start(port: number): void {
    this.app.use(express.static(execPath + '/res/public'));
    this.app.listen(port, () => {
      Logger.Imp(this.SERVER_STARTED + `http://localhost:${port}`);
    });
  }
} 

export default MainServer;
