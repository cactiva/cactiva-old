const jetpack = require('fs-jetpack');
const execa = require('execa');

(async () => {
  await execa('yarn', [], {}).stdout.pipe(process.stdout);
  await execa('yarn', [], {
    cwd: './server'
  }).stdout.pipe(process.stdout);
})();

const web = execa('yarn', ['start']);
const server = execa('yarn', ['start'], {
  cwd: './server'
});

web.stdout.pipe(process.stdout);
web.stderr.pipe(process.stderr);
server.stdout.pipe(process.stdout);
server.stderr.pipe(process.stderr);

Promise.all([web, server]);
