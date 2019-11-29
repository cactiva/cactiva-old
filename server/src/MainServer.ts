import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as controllers from "./controllers";

import { Server } from "@overnightjs/core";
import { Logger } from "@overnightjs/logger";
import * as express from "express";
import { execPath } from "./config";
import { initWs } from "./controllers/WsRoute";
import jetpack = require("fs-jetpack");
import * as proxy from "http-proxy-middleware";

class MainServer extends Server {
  private readonly SERVER_STARTED = `Cactiva: `;
  portProxies = {} as any;
  constructor() {
    super(true);
    this.app.use(bodyParser.json());
    this.app.use(cors());
    this.app.use("/port/:port", (req, res, next) => {
      const port = req.params.port;
      if (parseInt(port)) {
        if (!this.portProxies[port]) {
          this.portProxies[port] = proxy({
            target: "http://localhost:" + req.params.port,
            changeOrigin: true,
            pathRewrite: (path, req) => {
              return path.substr(`/port:${port}`.length);
            }
          });
        }
        return this.portProxies[port](req, res, next);
      } else {
        res.send("Invalid Port");
      }
    });
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
    const path = jetpack.exists(execPath + "/res/public")
      ? execPath + "/res/public"
      : "./res/public";

    console.log(`Serving static files from: ${path}`);
    this.app.use("/", express.static(path));
    initWs(this.app).listen(port, () => {
      Logger.Imp(this.SERVER_STARTED + `http://localhost:${port}`);
    });
  }
}

export default MainServer;
