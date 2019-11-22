import * as path from "path";
import * as convict from "convict";
const fs = require("fs");
const jetpack = require("fs-jetpack");
export const isDev = !!jetpack.exists("../dev.js");
export const execPath = isDev
  ? path.resolve(path.dirname(__dirname) + "/../../")
  : path.dirname(process.execPath);
const config = convict({
  app: {
    doc: "Current App Name",
    format: String,
    default: ""
  },
  env: {
    doc: "The application environment.",
    format: ["production", "development"],
    default: "development",
    env: "NODE_ENV"
  },
  host: {
    doc: "The Host IP address to bind.",
    format: "ipaddress",
    default: "127.0.0.1",
    env: "IP_ADDRESS"
  },
  port: {
    doc: "The port to bind.",
    format: "port",
    default: 8080,
    env: "PORT",
    arg: "port"
  }
});

export const configPath = `${execPath}/config.json`;
(config as any).save = () => {
  fs.writeFile(configPath, config.toString(), {}, function(err: any) {
    if (err && err.code === "EEXIST") {
      config.loadFile(configPath);
    }
  });
};

if (!jetpack.exists(configPath)) {
  (config as any).save();
} else {
  try {
    config.loadFile(configPath);
  } catch (e) {
    (config as any).save();
  }
}

// Perform validation
config.validate({ allowed: "strict" });

export default config;
