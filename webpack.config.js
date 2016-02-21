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
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['es2015', 'stage-2'],
        },
      },
    ],
  },
};
