const http = require('http');
const WebSocketServer = require('websocket').server;

const server = http.createServer();
server.listen(7733);

const wsServer = new WebSocketServer({
    httpServer:server,
    maxRecievedFrameSize: 1
});

files = [];
var fileContent = "";

wsServer.on('request', function(request){
    const connection = request.accept(null, request.origin);

    connection.on('message', function(message){
        if(message.utf8Data.indexOf('EOF') != -1){
            console.log("\n\n");
            files.push(fileContent);
            fileContent = "";
        }
        else{
            fileContent += message.utf8Data;
            console.log(message.utf8Data);
        }
    });
    
    connection.on('close', function(reasonCode, description){
        console.log('Socket closed.' + reasonCode + ' ' + description);
    });
});

