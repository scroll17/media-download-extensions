const path = require("path");

const webpack = require('webpack');

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin');

if(!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

const isProduction = process.env.NODE_ENV === 'production';
const withOutChunks = true;

module.exports = {
    entry: path.join(__dirname, 'src', 'index.jsx'),
    output: {
        path: path.join(__dirname, "/public"),
        filename: "background.js"
    },
    resolve: {
        extensions: ['.js', '.jsx', '.sass']
    },
    mode: 'development',
    devtool: false, // disable "eval" in output js-code
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                },
            },
            {
                test: /\.module\.s(a|c)ss$/,
                loader: [
                    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            sourceMap: isProduction
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: isProduction
                        }
                    }
                ]
            },
            {
                test: /\.s(a|c)ss$/,
                exclude: /\.module.(s(a|c)ss)$/,
                loader: [
                    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: isProduction
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(jpe?g|png|gif)$/,
                use: [{
                    /* inline if smaller than 10 KB, otherwise load as a file */
                    loader: 'url-loader',
                    options: {
                        limit: 25000
                    }
                }]
            },
            {
                test: /\.(eot|svg|ttf|woff2?|otf)$/,
                use: 'file-loader'
            }
            // {
            //     test: /\.s[ac]ss$/i,
            //     use: [
            //         // Creates `style` nodes from JS strings
            //         'style-loader',
            //         // Translates CSS into CommonJS
            //         'css-loader',
            //         // Compiles Sass to CSS
            //         'sass-loader',
            //     ],
            // },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'public', 'index.html')
        }),
        new MiniCssExtractPlugin({
            filename: withOutChunks ? '[name].css' : '[name].[hash].css',
            chunkFilename: withOutChunks ? '[id].css' : '[id].[hash].css'
        })
    ],
    optimization: {
        minimize: isProduction,
        /** process.env.NODE_ENV */
        nodeEnv: 'production',
        /** not build if code have error */
        noEmitOnErrors: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    warnings: false,
                    output: {
                        comments: false
                    }
                }
            })
        ],
    }
};