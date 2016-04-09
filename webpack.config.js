module.exports = {
  entry: './src/main',
  output: {
    path: 'dist/',
    filename: 'main.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: [
            require.resolve('babel-preset-react'), // React preset is needed only for flow support.
            require.resolve('babel-preset-es2015'),
            require.resolve('babel-preset-stage-2'),
          ],
        },
      },
    ],
  },
};
