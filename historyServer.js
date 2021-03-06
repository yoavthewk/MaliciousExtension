const http = require('http');
const WebSocketServer = require('websocket').server;

const server = http.createServer();
server.listen(3333);

const wsServer = new WebSocketServer({
    httpServer:server
});

var history = new Array();

wsServer.on('request', function(request){
    const connection = request.accept(null, request.origin);

    connection.on('message', function(message){
        console.log(message.utf8Data); // print the history.
        history.push(message.utf8Data); // save the history.
    });
    connection.on('close', function(reasonCode, description){
        console.log('Socket closed.');
    });
});
