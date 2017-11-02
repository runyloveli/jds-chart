var path = require('path');
var webpack = require('webpack');
var ROOT_PATH = path.resolve(__dirname);
var BUILD_PATH = path.resolve(ROOT_PATH, 'build');
var SRC_PATH = path.resolve(ROOT_PATH, 'src');
module.exports= {
    entry: {
        //app: path.resolve(SRC_PATH, 'jdscharts.js')
        app: path.resolve(__dirname, 'index.js')
    },
    output: {
        libraryTarget: 'umd',
        library: 'jdscharts',
        path: BUILD_PATH,
        filename: 'jdscharts.js'
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
        loaders: []
    },
    plugins: [
        new webpack.DefinePlugin({
            'typeof __DEV__': JSON.stringify('boolean'),
            __DEV__: false
        })
    ]
};
