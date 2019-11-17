import path from 'path';

import webpack from 'webpack';

const isDevelopment = process.env.NODE_ENV === 'development';

const commonConfig: webpack.Configuration = {
  mode: isDevelopment ? 'development' : 'production',
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
        use: 'node-loader',
      },
      {
        test: /\.node$/,
        use: {
          loader: '@zeit/webpack-asset-relocator-loader',
          options: {},
        },
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
    entry: { preload: './src/preload' },
    target: 'electron-renderer',
  },
];

module.exports = configs;
