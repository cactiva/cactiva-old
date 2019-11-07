import * as cp from "child_process";
import * as pstree from "ps-tree";

export const streams = {} as any;
export default (name: string) => {
  if (!!streams[name]) {
    console.log(`stream with ${name} already exists`);
    return streams[name];
  }

  const stream = {
    name,
    log: "",
    send: (str: string) => {
      stream.log += str;
      const sws = stream.ws as any;
      if (sws !== null) {
        try {
          if (sws.readyState === sws.OPEN) sws.send(str);
        } catch (e) {
          console.log(e);
        }
      }
    },
    ws: null,
    status: "waiting",
    cli: null as any,
    close: () => {
      const sws = stream.ws as any;
      if (sws !== null) {
        sws.close();
      }

      if (stream.cli !== null) {
        const cli = stream.cli;
        const pid = cli.pid;
        pstree(pid, (err: any, children: readonly any[]) => {
          if (process.platform !== "win32") {
            cp.spawn(
              "kill",
              ["-9"].concat(
                children.map(function(p) {
                  return p.PID;
                })
              )
            );
          }
          cli.cancel();
          stream.cli = null;
        });
      }
      delete streams[name];
    }
  };
  streams[name] = stream;
  return stream;
};
