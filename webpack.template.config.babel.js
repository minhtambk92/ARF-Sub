/**
 * Created by manhhailua on 1/4/17.
 */

import webpack from 'webpack';
import StringReplacePlugin from 'string-replace-webpack-plugin';
import { version, author } from './package.json';

const { NAME, RELEASE, ARF_HOST } = process.env;
const libraryName = NAME || 'Template';

const config = {

  entry: `${__dirname}/src/template.js`,

  devtool: 'source-map',

  output: {
    path: `${__dirname}/build`,
    filename: RELEASE ? `${libraryName}.min.js` : `${libraryName}.js`,
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
      {
        test: /(template.js)$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: '{{arfHost}}',
              replacement() {
                return ARF_HOST || 'corejs.codek.org'; // Default host for ARF
              },
            },
          ],
        }),
      },
    ],
  },

  plugins: [
    new StringReplacePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': RELEASE ? '"production"' : '"development"',
    }),
    ...RELEASE ? [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
      }),
    ] : [],
    new webpack.BannerPlugin(`Advertisement data\nTemplate file v${version}\nCopyright 2016-${new Date().getFullYear()} ${author}\nZone: {{zoneId}}`),
  ],

};

export default config;
