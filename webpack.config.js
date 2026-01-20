//@ts-check

'use strict';

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/, /src[\\/]webview/],
        use: [
          {
            loader: 'ts-loader',
            options: {
              instance: 'extension'
            }
          }
        ]
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
};

/** @type WebpackConfig */
const webviewConfig = {
  target: 'web', // Webview runs in browser context
  mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: './src/webview/viewer.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'viewer.js',
    libraryTarget: 'umd'
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js'],
    extensionAlias: {
      '.js': ['.ts', '.js']
    }
  },
  experiments: {
    asyncWebAssembly: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              instance: 'webview',
              configFile: path.resolve(__dirname, 'src/webview/tsconfig.json'),
              transpileOnly: true,
              ignoreDiagnostics: [1479],
              compilerOptions: {
                module: 'ESNext',
                moduleResolution: 'bundler'
              }
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader', options: { inline: 'fallback' } }
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "node_modules/web-ifc-three/node_modules/web-ifc/web-ifc.wasm", to: "." },
        { from: "node_modules/web-ifc-three/node_modules/web-ifc/web-ifc-mt.wasm", to: "." }
      ],
    }),
  ],
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
};

module.exports = [extensionConfig, webviewConfig];