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
    cli: null,
    close: () => {
      const sws = stream.ws as any;
      if (sws !== null) {
        sws.close();
      }
      delete streams[name];
    }
  };
  streams[name] = stream;
  return stream;
};
