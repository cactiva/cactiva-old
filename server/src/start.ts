import * as fs from 'fs';
import config, { isDev, configPath } from './config';
import MainServer from './MainServer';
import * as open from 'open';
import { Morph } from './morph';

console.log(`
╔═╗
║  A C T I V A 
╚═╝       
`);
console.log('Config File: ' + configPath);

fs.access(__dirname, fs.constants.W_OK, function(err: any) {
  if (err) {
    console.error("ERROR: Can't write to " + __dirname);
    process.exit(1);
  }
});

if (!isDev) {
  setTimeout(() => {
    open('http://127.0.0.1:8080');
  }, 1500);
}

Morph.getInstance();

const server = new MainServer();
server.start(config.get('port'));
