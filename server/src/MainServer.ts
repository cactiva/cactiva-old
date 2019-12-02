import { Server } from "@overnightjs/core";
import { Logger } from "@overnightjs/logger";
import * as bodyParser from "body-parser";
import * as express from "express";
import * as cors from "cors";
import { execPath } from "./config";
import * as controllers from "./controllers";
import { initWs } from "./controllers/WsRoute";
import * as proxy from 'http-proxy-middleware';
import * as zlib from 'zlib';

import jetpack = require("fs-jetpack");
import { BodyableNode } from 'ts-morph';

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
            selfHandleResponse: true,
            changeOrigin: true,
            pathRewrite: (path, req) => {
              return path.substr(`/port:${port}`.length);
            },
            onProxyRes: (proxyRes: any, req: any, res: any) => {
              let originalBody = Buffer.from("");
              proxyRes.on("data", function (data: any) {
                originalBody = Buffer.concat([originalBody, data]);
              });
              if (proxyRes.headers["content-type"].indexOf("html") >= 0) {
                proxyRes.on("end", function () {
                  let bodyString = originalBody.toString("utf8");
                  if (proxyRes.headers["content-encoding"] === "gzip") {
                    bodyString = zlib.gunzipSync(originalBody).toString("utf8");
                  }
                  bodyString = bodyString.replace(/'\//ig, `'/port/${port}/`);
                  bodyString = bodyString.replace(/"\//ig, `"/port/${port}/`);
                  bodyString = bodyString.replace(
                    `</body>`,
                    `<script type="text/javascript">
                    document.head.innerHTML = document.head.innerHTML + "<base href='" + document.location.href + "' />";
                </script></body>`
                  )
                  res.end(bodyString);
                });
              } else {
                proxyRes.on("end", function () {
                  let bodyString = originalBody.toString("utf8");
                  if (proxyRes.headers["content-encoding"] === "gzip") {
                    bodyString = zlib.gunzipSync(originalBody).toString("utf8");
                  }
                  res.end(bodyString);
                });
              }
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
