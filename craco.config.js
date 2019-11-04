const CracoAlias = require('craco-alias');

const path = require('path');
const fs = require('fs');
const rewireBabelLoader = require('craco-babel-loader');
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  eslint: {
    enable: false
  },
  webpack: {
    alias: {},
    plugins: [new MonacoWebpackPlugin()],
    configure: (webpackConfig, { env, paths }) => {
      return webpackConfig;
    }
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
