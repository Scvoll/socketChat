const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");


module.exports = {
    devtool: "sourceMap",
    entry: './client/src/index.js',
    output: {
        path: path.resolve(__dirname, './build'),
        filename: "bundle.js",
    },
    devServer: {
        open: true,
        contentBase: path.join(__dirname, './client'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.(c|sc)ss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'style.css',
            chunkFilename: "[id].css"
        }),
        new HtmlWebPackPlugin({
            inject: true,
            template: './client/index.html'
        })
    ]
};