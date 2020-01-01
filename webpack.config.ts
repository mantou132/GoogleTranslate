import path from 'path';

import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const isDevelopment = process.env.NODE_ENV === 'development';

const commonConfig: webpack.Configuration = {
  mode: isDevelopment ? 'development' : 'production',
  watchOptions: {
    ignored: [/node_modules/, /dist/],
  },
  node: {
    __dirname: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.node$/,
        loader: 'native-ext-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.node'],
  },
  output: {
    publicPath: './',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new webpack.DefinePlugin({
      __public: isDevelopment
        ? `'${__dirname}${path.sep}public'`.replace(/\\/g, '\\\\')
        : `require('path').resolve(process.resourcesPath, 'public')`,
    }),
  ],
  devtool: 'source-map',
};

const configs: webpack.Configuration[] = [
  {
    ...commonConfig,
    entry: { index: './src/main' },
    target: 'electron-main',
  },
  {
    ...commonConfig,
    entry: { settings: './src/settings' },
    target: 'electron-renderer',
    plugins: [
      ...(commonConfig.plugins || []),
      new HtmlWebpackPlugin({
        filename: 'settings.html',
      }),
    ],
  },
  {
    ...commonConfig,
    entry: { preload: './src/preload' },
    target: 'electron-renderer',
  },
];

module.exports = configs;
