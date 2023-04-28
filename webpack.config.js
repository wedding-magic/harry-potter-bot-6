const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, 'src', 'client', 'index.js'),
  output: {path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle.js',
  },
  mode: 'development',
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    static: {
      directory: path.resolve(__dirname, 'dist'),
      publicPath: '/',
    },
    hot: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        pathRewrite: {'^/api': ''}
      },
      secure: false
  
    },
  },
  module: {
    rules: [
      {test: /.(js|jsx)$/,
        exclude: /node_modules/,
        use: {loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }            
      },
      {
        test: /.(css|scss)$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'client', 'index.html'),
    }),
  ],
};