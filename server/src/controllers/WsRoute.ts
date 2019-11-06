import { Morph } from "../morph";
import { streams } from "../stream";
const enableWs = require("express-ws");

export const initWs = (app: any): any => {
  const ews = enableWs(app);
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
