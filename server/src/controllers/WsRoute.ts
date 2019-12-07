import * as _ from 'lodash';
import * as path from 'path';
import * as nodepty from "node-pty";
import { streams } from "../stream";
import { execPath } from '../config';
const enableWs = require("express-ws");
const pty = {} as {
  [key: string]: {
    name: string
    ws: WebSocket
    process: any
    logs: string
  }
};
export const initWs = (app: any): any => {
  const ews = enableWs(app);
  ews.app.ws("/api/pty", (ws: any, req: any) => {
    ws.on("message", (msg: string) => {
      if (msg.indexOf("start") === 0) {
        const s = msg.split("|");
        const id = s[1];
        const name = s[2];
        if (!pty[id]) {
          pty[id] = {
            name,
            ws,
            process: nodepty.spawn('fish', [], {
              name: 'xterm-color',
              cols: 80,
              rows: 30,
              cwd: path.join(execPath, "app", name),
            }),
            logs: ""
          }
        } else {
          if (pty[id].ws.readyState === pty[id].ws.OPEN) {
            pty[id].ws.close();
          }
          ws.send(pty[id].logs);
        }
        const p = pty[id];
        let templog = "";
        const send = _.throttle(() => {
          if (ws.readyState === ws.OPEN) {
            ws.send(templog);
          }
          templog = "";
        }, 10);
        p.process.onData((e: string) => {
          templog += e;
          p.logs += e;

          if (p.logs.length > 20000) {
            p.logs = p.logs.substr(p.logs.length - 20000);
          }
          send();
        })
        ws.on("message", (e: string) => {
          p.process.write(e);
        })
      }
    });
  });
  ews.app.ws("/api/ws", (ws: any, req: any) => {
    let wsname = "";
    ws.on("message", (msg: string) => {
      if (msg.indexOf("start") === 0) {
        const s = msg.split("|");
        if (!!streams[s[1]]) {
          const stream = streams[s[1]];
          stream.ws = ws;
          wsname = s[1];
          ws.send(stream.log);
        }
      }
    });

    ws.on("close", () => {
      console.log(`WebSocket ${wsname} was closed`);
    });
  });
  return ews.app;
};
