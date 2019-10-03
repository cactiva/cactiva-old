const CracoAlias = require('craco-alias');

const path = require('path');
const fs = require('fs');
const rewireBabelLoader = require('craco-babel-loader');
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  eslint: {
    enable: false
  },
  babel: {
    plugins: ['emotion']
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        tsConfigPath: 'tsconfig.main.json'
      }
    },
    {
      plugin: rewireBabelLoader,
      options: {
        presets: ['mobx']
      }
    }
  ]
};
