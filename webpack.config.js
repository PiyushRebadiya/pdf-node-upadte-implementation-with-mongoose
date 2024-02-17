const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js', // Entry point of your application
  output: {
    path: path.resolve(__dirname, 'build'), // Output directory
    filename: 'bundle.js' // Output bundle file
  },
  target: 'node', // Set the target environment to Node.js
  externals: {
    // Exclude 'fs' module from being bundled by webpack
    fs: 'commonjs fs',
    express: 'commonjs express',
    // Exclude 'path' module from being bundled by webpack
    path: 'commonjs path'
  },
  module: {
    rules: [
      // Add any necessary loaders here for processing different file types (e.g., JavaScript, CSS, etc.)
      // For example, babel-loader for transpiling JavaScript files
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js'] // File extensions to resolve
  },
  plugins: [
    // Add any necessary plugins here
    // For example, HtmlWebpackPlugin for generating HTML files
    // new HtmlWebpackPlugin({
    //   template: './src/index.html'
    // })
  ]
};
