/**
 * Created by moviezhou on 12/5/15.StreamServer
 */


module.exports = function (logger) {
    function StreamServer(secret,strmcallback,wscallback){
        this.logger  = logger;
        this.STREAM_SECRET = secret;
        this.STREAM_MAGIC_BYTES = 'jsmp';
        this.width = 320;
        this.height = 240;
        this.strmcallback = strmcallback;
        this.wscallback = wscallback;

        this.webSocketServer = null;     // awaiting WebSocket connections
        this.httpStreamServer = null;    // listening for MPEG stream

        var self = this;

        self.httpServer = require('http').createServer().listen(0,
            function(wscallback) {
                var wsport = self.httpServer.address().port;
                self.wscallback(wsport);
                self.logger.info(" websocket server opened on %j", wsport);
            });

        var WebSocketServer = require('ws').Server;


        //var wss = new WebSocketServer({ server: server });
        //this.webSocketServer = new (require('ws').Server)({port: this.WEBSOCKET_PORT});

        this.webSocketServer = new WebSocketServer({ server: self.httpServer });
        var sock_server = this.webSocketServer;

        this.webSocketServer.on('connection', function(socket){

            // Send magic bytes and video size to the newly connected socket
            // struct { char magic[4]; unsigned short width, height;}

            var streamHeader = new Buffer(8);
            streamHeader.write(self.STREAM_MAGIC_BYTES);
            streamHeader.writeUInt16BE(320, 4);
            streamHeader.writeUInt16BE(240, 6);
            socket.send(streamHeader, {binary:true});

            self.logger.info( 'New WebSocket Connection ('+sock_server.clients.length+' total)' );
            socket.on('close', function(code, message){
                self.logger.info( 'Disconnected WebSocket ('+sock_server.clients.length+' total)' );
            });
        });

        this.webSocketServer.broadcast = function(data, opts) {
            for( var i in this.clients ) {
                if (this.clients[i].readyState == 1) {
                    this.clients[i].send(data, opts);
                }
                else {
                    self.logger.warn( 'Error: Client ('+i+') not connected.' );
                }
            }
        };
    }

    // HTTP Server to accept incomming MPEG Stream
    StreamServer.prototype.start = function (){
        var secret = this.STREAM_SECRET;
        var sockserver = this.webSocketServer;
        var self = this;
        self.httpStreamServer = require('http').createServer( function(request, response) {
            var params = request.url.substr(1).split('/');
            if( params[0] == secret ) {
                this.width = (params[1] || 320)|0;
                this.height = (params[2] || 240)|0;

                self.logger.info(
                    'Stream Connected: ' + request.socket.remoteAddress +
                    ':' + request.socket.remotePort + ' size: ' + this.width + 'x' + this.height
                );
                request.on('data', function(data){
                    sockserver.broadcast(data, {binary:true});
                });
            }
            else {
                self.logger.info(
                    'Failed Stream Connection: '+ request.socket.remoteAddress +
                    request.socket.remotePort + ' - wrong secret.'
                );
                response.end();
            }
        }).listen(0, function(strmcallback) {                   // Get a random port from os
            var strmport = self.httpStreamServer.address().port;
            self.logger.info("stream server opened on %j", strmport);
            self.strmcallback(strmport);

        });
    };

    StreamServer.prototype.close = function(){
        if(this.webSocketServer){
            this.webSocketServer.close();
            this.httpServer.close();
            this.httpStreamServer.close();
        }
    };

    return StreamServer;
}
