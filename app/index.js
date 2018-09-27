var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

var httpServer = http.createServer(function (req, res) {
    unifiedServer(req, res);
});

httpServer.listen(3005, function () {
    console.log("the server is listening on port " + 3005);
});


var unifiedServer = function (req, res) {
    var parsedUrl = url.parse(req.url, true);

    var path = parsedUrl.pathname;

    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function(data) {
        buffer += decoder.write(data);
    });

    req.on('end', function () {
        buffer += decoder.end();
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        var data = {
            "trimmedPath": trimmedPath,
            "payload": buffer
        };

        chosenHandler(data, function(statusCode, payload) {
            //use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            //use the payload called back by the handler or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            //convert payload object to a string
            var payloadString = JSON.stringify(payload);

            //return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });


    });
};

//define handlers
var handlers = {};

handlers.ping = function (data, callback) {
    callback(200, {"message": "App is up and running"});
};

handlers.hello = function (data, callback) {
    callback(200, {"message": "Node JS is fun"})
};

handlers.notFound = function (data, callback) {
    callback(404, {"message": "Hey, that path does not exist!"});
};


//routes
var router = {
    'hello': handlers.hello,
    'ping': handlers.ping
};