/**
 * 
 * Created by pavelnovotny on 18.08.16.
 */

var express = require("express");
var path = require("path");
var cors = require("cors");
var app = express();
var request = require("request");
var nconf = require('nconf');
var bodyParser = require('body-parser');

app.use(cors());

nconf.argv()
    .env()
    .defaults({ env : 'production' })
    .file({ file: 'config-'+nconf.get('env')+'.json' });

var jsonParser = bodyParser.json();
console.log("Listening on port: " + nconf.get('listen-port'));

//proxy
var proxied = ['/service_index/_search'];

app.use(function(req, res) {
    if (proxied.indexOf(req.path) != -1) {
        var newurl = nconf.get('proxied-site') + req.originalUrl;
        req.pipe(request[req.method.toLowerCase()](newurl)).pipe(res);
    }
});

app.listen(nconf.get('listen-port')).on('error', function(err) {
    console.error(err);
});


