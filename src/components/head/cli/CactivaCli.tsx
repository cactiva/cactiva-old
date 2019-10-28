import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from 'xterm-addon-web-links';
import "xterm/css/xterm.css";

export default observer(({ cliref, initialText }: any) => {
  useEffect(() => {
    const terminal = new Terminal({ fontSize: 10, convertEol: true });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());
    terminal.open(ref.current);

    setTimeout(() => {
      fitAddon.fit();
    });
    cliref.current = terminal;
    terminal.writeUtf8(initialText);
  }, []);
  const ref = useRef(null as any);
  return <div ref={ref} style={{ flex: 1, display: "flex" }}></div>;
});
