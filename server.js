const net    = require('net'); // to make sockets usable
var fs = require('fs') // to make files usable

const TCPWrap = process.binding('tcp_wrap');
const { TCP } = TCPWrap;
const socket  = new TCP(TCPWrap.constants.SERVER);

const HOST = '0.0.0.0', PORT = 3000

// Bind is done here.
socket.bind(HOST, PORT);

console.log('bound at : ' + HOST + ':' + PORT);

setTimeout(() => {
  const server = net.createServer((mySock) => {

    let origin = server.address()
    
    // 'connection' listener.
    console.log('client connected from : ' + origin.address + ':' + origin.port);

    mySock.on("data", function(data) {
        //console.log("Received " + data.length + " bytes\n" + data);
        let request_target = data.toString().split("\n")[0]
        let method;
        let path;
        if(request_target.slice(0, 3) === "GET"){
            method = "GET";
            request_target = request_target.slice(4, request_target.length)
            path = request_target.split(" ")[0].slice(1, request_target.split(" ")[0].length)
        }else if(request_target.slice(0, 4) === "POST"){
            method = "POST";
            request_target = request_target.slice(4, request_target.length)
            path = request_target.split(" ")[0].slice(1, request_target.split(" ")[0].length)
        }
        path = path == "" ? "/index" : path;
        fs.readFile('./'+path+'.html', 'utf8', function (err, html) {
            if (err) {
                throw err; 
            }   
            mySock.write("HTTP/1.1 200 OK\r\nDate : " + new Date() + "\r\nServer : JohannandCedrineServer\r\nlast-Modified : "+new Date() + "\r\nCache-Control : max-age=12000\r\nContent-Type: text/html; charset=utf-8\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accepthtml"+html, function(){console.log("'/' data has been sent")});
            mySock.end('', function(){"connection closed"})
        });
    });

    mySock.on('end', () => {
        console.log('client disconnected');
    });
  })
  .on('error', (err) => {
    throw err;
  })
  .listen(socket, function(){
    console.log('listening...');
  });

}, 1000);