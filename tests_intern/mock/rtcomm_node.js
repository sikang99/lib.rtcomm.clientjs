// File used for config of node.js to rtcomm and test it
//

global.window = global;
global.navigator = null;

// Setup WebSocket for mqtt
var WebSocketClient = require('websocket').client;

global.WebSocket = function(wsurl,protocol) {
    var ws = new WebSocketClient();
    var connection;
    var obj = {
        send: function(msg) {
            var nodeBuf = new Buffer(new Uint8Array(msg));
            connection.send(nodeBuf);
        },
        get readyState() { return ws.readyState; }
    };
    
    ws.binaryType = 'arraybuffer';
    
    ws.on("connect", function(conn) {
        connection = conn;
        conn.on("error", function (error) {
            console.log("socket error ",error);
            if (obj.onerror) {
                obj.onerror();
            }
        });
        
        conn.on("close", function(reasonCode, description) {
            console.log("socket closed ",description);
        })
        
        conn.on("message", function (message) {
            if (message.type === "binary") {
                if (obj.onmessage) {
                    obj.onmessage({data:message.binaryData});
                }
            }
        });
        if (obj.onopen) {
            obj.onopen();
        }
    });
    ws.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
        if (obj.onerror) {
            obj.onerror(error);
        }
    });
    ws.connect(wsurl, protocol);
    return obj;
}

var LocalStorage = require('node-localstorage').LocalStorage;
global.localStorage = new LocalStorage('./persistence');

require('../../lib/mqttws31');
