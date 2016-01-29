/**
 * Created by moviezhou on 1/26/16.
 */

var SocketServer = function(){
    var cls = function(httpServer, streamServer,logger){
        this.io = require('socket.io')(httpServer);
        this.streamServer = streamServer;
        this.logger = logger;
        this.webConns = {};     // {user: socket}
        this.webSockConns = {}; // {webSocketId:socketID, user:user}
        this.botConns = {};     // {botid: socket}
        this.userBotDict = {};

        this.botSockConns = {};  // {botSocketId:{botid,socket object}}
        this.botsOnline = {};    // {botid:id, socket:socket, wsport:wsport}

        this.strmServers = [];

        var self = this;


        this.getBotSock = function(webSockId){
            var user = self.webSockConns[webSockId];
            var botId, botSock;
            if(self.userBotDict[user]){
                botId = self.userBotDict[user];
                botSock = self.botConns[botId];
                return botSock;
            }
        };


        this.start = function(){
            this.io.on('connection', function(socket){
                socket.on('disconnect', function(){
                    self.logger.info(socket.id + ' disconnected');

                    if(self.webSockConns[socket.id]){
                        // delete webCoons here

                        for(var user in self.webConns){
                            if(self.webConns[user].id == socket.id){
                                delete self.webConns[user];
                            }
                        }



                        delete self.webSockConns[socket.id];
                    }
                    else if(self.botSockConns[socket.id]){
                        socket.broadcast.emit('botoffline', self.botSockConns[socket.id].botid);

                        var strmServerCount = self.strmServers.length;
                        var closedServerIndex;
                        if(strmServerCount > 0){
                            for(var i = 0; i < strmServerCount; i++){
                                if(self.strmServers[i].botid == self.botSockConns[socket.id].botid){
                                    self.strmServers[i].strmServer.close();
                                    closedServerIndex = i;
                                    break;
                                }
                            }
                            self.strmServers.splice(closedServerIndex,1);
                        }
                        console.log(self.strmServers.length);
                        delete self.botsOnline[self.botSockConns[socket.id].botid];
                        delete self.botSockConns[socket.id];
                    }
                    self.logger.info('socket ' + socket.id + ' disconnected');
                });

                socket.on('webui', function(msg){
                    self.logger.info('webui online, socket: ' + socket.id);
                    self.webConns[msg.user] = socket;
                    self.webSockConns[socket.id] = msg.user;
                    self.userBotDict[msg.user] = msg.bot;
                    socket.emit('webuisync',self.botsOnline);
                });

                /*Bot arm froward & backwoard*/
                socket.on('armXY', function(msg){

                    var botSock = self.getBotSock(socket.id);
                    if(botSock){
                        botSock.emit('armXY', msg);
                    }
                });

                /*Bot arm lift & down*/
                socket.on('armZ', function(msg){
                    var botSock = self.getBotSock(socket.id);
                    if(botSock){
                        botSock.emit('armZ', msg);
                    }
                });

                /*Bot arm built in command, swing,wave,etc*/
                socket.on('armBI', function(msg){
                    var botSock = self.getBotSock(socket.id);
                    if(botSock){
                        botSock.emit('armBI', msg);
                    }
                });

                /*Bot move manual*/
                socket.on('move', function(msg){
                    var botSock = self.getBotSock(socket.id);
                    if(botSock){
                        botSock.emit('move', msg);
                    }
                });

                /*Bot move stop*/
                socket.on('stop', function(msg){
                    var botSock = self.getBotSock(socket.id);
                    if(botSock){
                        botSock.emit('stop', msg);
                    }
                });

                /*Bot move auto navigation*/
                socket.on('movtarget', function(msg){
                    var botSock = self.getBotSock(socket.id);
                    if(botSock){
                        botSock.emit('movtarget', msg);
                    }
                });

                /*Camera on & off*/
                socket.on('cam', function(msg){
                    var botSock = self.getBotSock(socket.id);
                    if(botSock){
                        botSock.emit('cam', msg);
                    }
                });

                /*Command line directive*/
                socket.on('botcmd', function(msg){
                    var botSock = self.getBotSock(socket.id);
                    if(botSock){
                        botSock.emit('botcmd', msg);
                    }
                });

                socket.on('botonline', function (msg) {
                    // Create & start video stream server

                    var streamServer = new self.streamServer('123',
                        function (strmport) {
                            socket.emit('streamport', strmport);
                        },
                        function(wsport){
                            self.botsOnline[msg.id] = wsport;
                            socket.broadcast.emit('botonline', {id: msg.id, wsport: wsport});

                            for(var user in self.userBotDict){
                                if(self.userBotDict[user] == msg.id){
                                    if(self.webConns[user])
                                    {
                                        self.webConns[user].emit('botactive', {id: msg.id, wsport: wsport});
                                    }
                                }
                            }

                            //self.logger.info("botid " + msg.id + " ,ws port " + wsport);
                        });
                    streamServer.start();

                    self.strmServers.push({botid: msg.id ,strmServer:streamServer});

                    self.botSockConns[socket.id] = {botid: msg.id, socket: socket};
                    self.botConns[msg.id] = socket;
                    self.logger.info('bot ' + msg.id + ' online, socket: ' + socket.id);
                    socket.emit('botcmd', 'bot online copy');
                });
            });
        };
    }

    return cls;
}();

module.exports = SocketServer;