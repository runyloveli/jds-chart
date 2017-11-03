var path = require('path');
var webpack = require('webpack');
var ROOT_PATH = path.resolve(__dirname);
var BUILD_PATH = path.resolve(ROOT_PATH, 'build');
var SRC_PATH = path.resolve(ROOT_PATH, 'src');
module.exports= {
    entry: {
        //app: path.resolve(SRC_PATH, 'jdscharts.js')
        app: path.resolve(__dirname, 'start.js')
    },
    output: {
        libraryTarget: 'umd',
        library: 'jdschart',
        path: BUILD_PATH,
        filename: 'jdschart.js'
    },
    //externals: {
    //    jdscharts: "jdscharts"
    //},

    //enable dev source map
    //devtool: 'eval-source-map',
    //enable dev server
    devServer: {
        historyApiFallback: true,
        hot: true,
        inline: true,
        progress: true
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
        root: SRC_PATH
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(mp4|ogg|svg)$/,
                loader: 'file-loader'
            },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'typeof __DEV__': JSON.stringify('boolean'),
            __DEV__: false
        })
    ]
};
