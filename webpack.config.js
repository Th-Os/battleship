var path = require("path"),
    webpack = require("webpack"),
    autoprefixer = require("autoprefixer"),
    ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
    context: path.join(__dirname, "src"),
    entry: "./app.js",
    output: {
        path: path.join(__dirname, "client"),
        filename: "js/script.js"
    },
    cache: false,
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel",
                query: {
                    presets: ["es2015"]
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style", "css!postcss")
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract("style", "css!postcss!sass")
            }
        ]
    },
    postcss: [
        autoprefixer({
            browsers: ["last 2 versions"]
        })
    ],
    plugins: [
        new ExtractTextPlugin("css/style.css"),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ]
};
