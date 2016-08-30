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
var convert = require('else-markup-conversion');
var Stream = require('stream');
var fs = require('fs');

nconf.argv()
    .env()
    .defaults({ env : 'production' })
    .file({ file: 'config-'+nconf.get('env')+'.json' });

app.use(cors());

var customerTemplate = fs.readFileSync(nconf.get('customer-template'), 'utf8');

var jsonParser = bodyParser.json();
console.log("Listening on port: " + nconf.get('listen-port'));


app.use(function(req, res) {
    var newurl = nconf.get('proxied-site') + req.originalUrl;
    var str = '';
    req.on('data', function(buffer){
        var part = buffer.toString();
        str += part;
    });
    req.on('end', function() {
        console.log(str);
        var stream = new Stream();
        stream.pipe = function(dest) {
            var converted = convert.searchQuery(str, customerTemplate);
            console.log("Converted: " + converted);
            dest.write(converted);
            return dest;
        };
        stream.pipe(request[req.method.toLowerCase()](newurl)).pipe(res);
    });
    req.on('finish', function() {
        console.log("Finished request");
    });
    //req.pipe(request[req.method.toLowerCase()](newurl)).pipe(res);
});

app.listen(nconf.get('listen-port')).on('error', function(err) {
    console.error(err);
});


