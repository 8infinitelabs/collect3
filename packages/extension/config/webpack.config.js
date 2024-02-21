'use strict';

const { merge } = require('webpack-merge');
const Dotenv = require('dotenv-webpack');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      popup: PATHS.src + '/popup.ts',
      contentScript: PATHS.src + '/contentScript.ts',
      preview: PATHS.src + '/pages/preview/preview.ts',
      articles: PATHS.src + '/pages/articles/articles.ts',
      storage: PATHS.src + '/pages/storage/storagePage.ts',
    },
    plugins: [
      new Dotenv({
        path: PATHS.src + '/../.env',
        safe: true,
      }),
    ],
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
