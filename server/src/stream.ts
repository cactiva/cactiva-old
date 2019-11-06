export const streams = {} as any;
export default (name: string) => {
  if (!!streams[name]) {
    console.log(`stream with ${name} already exists`);
    return false;
  }

  const stream = {
    name,
    log: "",
    send: (str: string) => {
      stream.log += str;
      const sws = stream.ws as any;
      if (sws !== null) {
        sws.send(str);
      }
    },
    ws: null,
    status: "waiting",
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
