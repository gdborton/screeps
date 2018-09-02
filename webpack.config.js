const path = require('path');

module.exports = {
  entry: './src/main',
  output: {
    path: path.resolve('dist/'),
    filename: 'main.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: [
            require.resolve('babel-preset-react'), // React preset is needed only for flow support.
            require.resolve('babel-preset-es2015'),
            require.resolve('babel-preset-stage-2'),
          ],
        },
      },
    ],
  },
  mode: 'none',
};
