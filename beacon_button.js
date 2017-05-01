require('date-utils');
var topic = "nexway/officeglico"
var AWS = require("aws-sdk");
var rekognition = new AWS.Rekognition({region: 'us-west-2'});
var fs = require('fs');
var awsIot = require('aws-iot-device-sdk');
var topic = "nexway/officeglico"

// Define paramerters to publish a message
var device = awsIot.device({
  keyPath: 'certs/edison1.private.key',
  certPath: 'certs/edison1.cert.pem',
  caPath: 'certs/root-CA.crt',
  clientId: 'edison_pub_client',
  region: 'ap-northeast-1'
});

// slack関連設定
var IncomingWebhook = require('@slack/client').IncomingWebhook;
require('dotenv').config();
var url = process.env.SLACK_WEBHOOK_URL || ''; 
var webhook = new IncomingWebhook(url);

var noble = require('noble');
//BLEのための変数宣言
var serviceUUIDs = ['1230010039fa4005860c09362f6169da'];
var characteristicUUIDs = ['1230010139fa4005860c09362f6169da'];
var allowDuplicates = true;
var buttons = ['like', 'dislike', 'help'];

var five = require("johnny-five");
var Edison = require("galileo-io");
var board = new five.Board({io: new Edison()});
board.on("ready", function() {
  var http = require( 'http' );
  var socketio = require( 'socket.io' );
  var fs = require( 'fs' );
  var led_13 = new five.Led(13);
  
  // 3000番ポートでHTTPサーバーを立てる
  var server = http.createServer( function( req, res ) {
    res.writeHead(200, { 'Content-Type' : 'text/html' }); // ヘッダ出力
    res.end( fs.readFileSync('./index.html', 'utf-8') );  // index.htmlの内容を出力
  }).listen(3000);

  var io = socketio.listen( server );
  io.sockets.on( 'connection', function(socket) {
    console.log('some websocket client is connected to the websocket server edison');
  });

  //ペリフェラル検索のイベントに対するコールバック設定
  noble.on('stateChange', function(state) {
      console.log('state of central ble device is : ' + state);
      if (state === 'poweredOn') {
        noble.startScanning(serviceUUIDs, allowDuplicates);
      } else {
          noble.stopScanning();
      }
  });

  noble.on('scanStart', function() {
      console.log('start scan');
  });

  noble.on('scanStop', function() {
      console.log('stop scan\n');
  });

  noble.on('discover', discoverPeripheral);

function discoverPeripheral(peripheral) {
      console.log('discovered peripheral: \n' + peripheral);
      localName = peripheral.advertisement.localName;
      if (localName.match(/nex_/)) { 
        console.log('Found peripheral device with local name: ' + localName);
        // peripheralを検知したら、一旦stop scan(BTN01ビーコンボタンが押されたら、３秒間連続信号を飛ばしてしまうから。)
        noble.stopScanning();

        beaconName = localName.slice(4);
        if (buttons.indexOf(beaconName) >= 0) {
            io.sockets.emit("nex_button", beaconName);
            console.log("emitted the message: " + beaconName);

            var slackMessage = beaconName + "ボタン押下";
            webhook.send(slackMessage, function(err, res) {
              if (err) {
                console.log('Error:', err);
              } else {
                console.log('Message sent to slack is: ', slackMessage);
              }
            });

        var dt = new Date();
        var timestamp = dt.toFormat("YYYYMMDDHH24MISS");
        var value = {"button" : beaconName}
        device.publish(topic + "/" + timestamp, JSON.stringify(value));
        console.log("publish " + topic + "/" + timestamp + " " + beaconName + " button");
        }

        // 5秒後startscan,  連打は無視される
        setTimeout(function(){noble.startScanning(serviceUUIDs, allowDuplicates)}, 5000);
      }
}

  // Connect to Message Broker
  device.on('connect', function() {
    console.log('Connected to Message Broker.');
  });

});
