/**
 * Created by manhhailua on 1/4/17.
 */

import webpack from 'webpack';
// import WebpackStrip from 'strip-loader';
import {
  version,
  description,
  author,
  license,
  homepage,
} from './package.json';

const { NAME, RELEASE } = process.env;
const libraryName = NAME || 'Library';
const libraryFileName = `${libraryName}${RELEASE ? '.min' : ''}.js`;

const config = {

  entry: `${__dirname}/src/index.js`,

  devtool: 'source-map',

  output: {
    path: `${__dirname}/build`,
    filename: libraryFileName,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },

  module: {
    loaders: [
      {
        test: /(\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
        query: {
          compact: 'auto',
        },
      },
      {
        test: /(\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },
      // {
      //   test: /\.js$/,
      //   loader: WebpackStrip.loader('debug', 'console.log'),
      // },
    ],
  },

  resolve: {
    alias: {
      vue$: `${__dirname}/node_modules/vue/dist/vue.common.js`,
    },
    extensions: ['.js'],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': RELEASE ? '"production"' : '"development"',
    }),
    ...RELEASE ? [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          pure_funcs: ['console.log'],
        },
        comments: false,
      }),
    ] : [],
    new webpack.BannerPlugin(`${libraryFileName} v${version}\n${description}\n© 2016-${new Date().getFullYear()} ${author}\nReleased under the ${license} License.\n${homepage}`),
  ],

};

export default config;
