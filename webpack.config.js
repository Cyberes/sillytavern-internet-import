const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');


const serverConfig = {
    devtool: false,
    target: 'node',
    entry: './src/index.ts',
    externals: [nodeExternals()],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'internet-import.js',
        libraryTarget: 'commonjs',
        libraryExport: 'default',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                use: 'html-loader',
            },
        ],
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
            }),
        ],
    },
    plugins: [],
};

module.exports = [serverConfig];
