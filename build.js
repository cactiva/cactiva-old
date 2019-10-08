const execa = require('execa');
const jetpack = require('fs-jetpack');
const commandExists = require('command-exists');
(async function() {
  if (!(await commandExists('expo')) || !(await commandExists('nexe'))) {
    console.log(`
Please install expo-cli and nexe:
   sudo npm i -g expo-cli nexe
`);
    return;
  }

  const settings = require('./.expo/settings.json');
  settings.dev = false;
  settings.minify = true;
  jetpack.write('./.expo/settings.json', JSON.stringify(settings));

  console.log('Building Front End...');
  const build = execa('expo', ['build:web']);
  await build;

  jetpack.remove('./server/res/public');
  jetpack.move('./web-build', './server/res/public');

  console.log('Building Back End...');
  let configExists = false;
  if (jetpack.exists('./server/config.json')) {
    configExists = true;
    jetpack.move('./server/config.json', './server/config.old.json');
  }

  jetpack.remove('./server/app');

  const sbuild = execa('yarn', ['build'], {
    cwd: './server'
  });
  await sbuild;

  jetpack.copy('./server/res', './server/build/res');
  const nexe = execa(
    'nexe',
    ['-i', 'start.js', '-o', 'cactiva', '-r', 'res/**/*'],
    {
      cwd: './server/build'
    }
  );
  nexe.stdout.pipe(process.stdout);
  await nexe;

  jetpack.remove('./cactiva');
  jetpack.move('./server/build/cactiva', './cactiva');
  jetpack.remove('./server/build');

  if (configExists) {
    jetpack.move('./server/config.old.json', './server/config.json');
  }
  console.log('Done: cactiva executable has been built');
})();
