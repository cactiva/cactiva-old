import axios from "axios";
import editor from "@src/store/editor";
const isDev = require("@src/env").mode === "development";

class Api {
  url = (isDev ? "http://localhost:8080" : "") + `/api/`;

  getUrl(url: string) {
    const d = url.indexOf("?") >= 0 ? "&" : "?";
    return this.url + url.replace(/^\/+/g, "") + `${d}project=${editor.name}`;
  }
  async get(url: string, opt?: any) {
    const res = await axios.get(this.getUrl(url), opt);
    return res.data;
  }
  async post(url: string, body?: any, config?: any) {
    const res = await axios.post(this.getUrl(url), body, config);
    return res.data;
  }

  stream(name: string, onmessage: any, onclose?: any) {
    const url = `${window.location.protocol}//${window.location.hostname}/api/`;
    const ws = new WebSocket((url + "ws").replace("http", "ws"));                
    ws.onopen = ev => {
      ws.send("start|" + name);
    };
    ws.onmessage = onmessage;
    ws.onclose = onclose;
  }
}

export default new Api();
