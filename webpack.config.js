const webpack = require('webpack');
const path = require('path');

const config = {
  entry: './src/app.ts',
  output: {
    path: path.resolve(__dirname, 'dev'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  devServer: {
    contentBase: path.join(__dirname, 'dev'),
    compress: true,
    port: 8080
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {/* Loader options go here */}
      },
      {test: /\.tsx?$/, loader: 'ts-loader'}
    ]
  }
};

module.exports = config;
