var express = require('express'),
    app = express(),
    serveStatic = require('serve-static'),
    path = require('path'),
    babel = require('babel-middleware'),
    http = require('http'),
    httpServer = http.Server(app),
    argv = require("yargs").argv,
    proxyServer = require('http-route-proxy'),
    port = process.env.PORT || argv.port || 9000,
    appName = argv.app,
    host = process.env.HOST || argv.host || 'localhost',
    target = (argv.dist ? '/dist/' : '/src/') + appName + '/';

app.use(express.static(path.join(__dirname, target)));

app.use(serveStatic(path.join(__dirname, target), {
    'index': ['index.html']
}));

// app.use(serveStatic(path.join(__dirname, target)),
//     babel({
//         srcPath: path.join(__dirname, target),
//         cachePath: __dirname + '/_cache',
//         babelOptions: {
//             presets: ['es2015']
//         }
//     })
// );



app.listen(port, host);
console.log('Server is runnig at ' + host + ':' + port + '\nTarget: ' + target + '\nApp: ' + appName);
