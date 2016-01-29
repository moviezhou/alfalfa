/**
 * Created by moviezhou on 12/5/15.
 */

/*
* port resource management functionality for this app,
* application can ask available ports pair {httpStream,webSocket} and return them back when ports pair
* no longer being used.
* */

var net = require('net');

var srv = net.createServer(function(sock) {
    sock.end('Hello world\n');
});
srv.listen(0, function() {
    console.log('Listening on port ' + srv.address().port);
});

this.webSocketServer = new (require('ws').Server)({port: srv.address().port});
