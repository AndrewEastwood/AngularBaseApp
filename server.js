var express = require('express'),
    app = express(),
    serveStatic = require('serve-static'),
    path = require('path'),
    http = require('http'),
    httpServer = http.Server(app),
    argv = require("yargs").argv,
    proxyServer = require('http-route-proxy'),
    port = process.env.PORT || argv.port || 9000,
    appName = argv.app || 'index',
    host = process.env.HOST || argv.host || 'localhost',
    target = argv.dist ? '/ui/dist' : '/ui/src/solution';

app.use(express.static(path.join(__dirname, target)));

app.use(serveStatic(path.join(__dirname, target), {
    'index': [appName + '.html']
}));

app.listen(port, host);
console.log('Server is runnig at ' + host + ':' + port + '\nTarget: ' + target + '\nApp: ' + appName);
