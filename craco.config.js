const CracoAlias = require("craco-alias");

const path = require("path");
const fs = require("fs");
const rewireBabelLoader = require("craco-babel-loader");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

module.exports = {
  eslint: {
    enable: false
  },
  webpack: {
    externals: { '@microsoft/typescript-etw': 'FakeModule' },
    alias: {},
    plugins: [
      new MonacoWebpackPlugin(),
      new BundleAnalyzerPlugin(),
      new webpack.ContextReplacementPlugin(
        /graphql-language-service-interface[\\/]dist$/,
        new RegExp(`^\\./.*\\.js$`)
      )
    ],
    configure: (webpackConfig, { env, paths }) => {
      return webpackConfig;
    }
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: "tsconfig",
        tsConfigPath: "tsconfig.main.json"
      }
    },
    {
      plugin: rewireBabelLoader,
      options: {
        presets: ["mobx"]
      }
    }
  ]
};
