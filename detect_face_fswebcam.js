require('date-utils');

function execute(cmd, args, onEnd) {
  var spawn = require('child_process').spawn
    , child = spawn(cmd, args)
    , me = this;
  me.stdout = '';
  me.stderr = '';
  child.stdout.on('data', function (data) { me.stdout += data.toString(); });
  child.stderr.on('data', function (data) { me.stderr += data.toString(); });
  child.stdout.on('end', function () { onEnd(me) });
}

var five = require("johnny-five");
var edison = require("edison-io");
var board = new five.Board({io:new edison()});
board.on("ready", function() {

  // Create a new `motion` hardware instance.
  var motion = new five.Motion(2);
  var led    = new five.Led(3);

  // "calibrated" occurs once, at the beginning of a session,
  motion.on("calibrated", function() {
    console.log("calibrated", Date.now());
  });

  // "motionstart" events are fired when the "calibrated"
  // proximal area is disrupted, generally by some form of movement
  motion.on("motionstart", function() {
    console.log("Detecting moving object", Date.now());
    led.on();
    takePicture();
  });

  // "motionend" events are fired following a "motionstart" event
  // when no movement has occurred in X ms
  motion.on("motionend", function() {
    console.log("No moving objects detected", Date.now());
    led.off();
    clearInterval(interval);
 });

});

var formatted;
var file_name;
var dt;
var interval;
var AWS = require("aws-sdk");
var rekognition = new AWS.Rekognition({region: 'us-west-2'});
var fs = require('fs');

function takePicture() {
  interval = setInterval(function() {
    dt = new Date();
    formatted = dt.toFormat("YYYYMMDDHH24MISS");
    file_name = '/media/sdcard/fswebcam_' + formatted + '.jpg';
    new execute(
        'fswebcam'
      , ['--no-banner', file_name]
      , function (me) {
          fs.readFile(file_name, function (err, data) {
            if (err) { console.log("error happend while read the file" + file_name);}
            else {
              console.log("file read succuss");
              var params = {
                Attributes: [
                    "ALL"
                ],
                Image: {
                    Bytes: data
                }
              }
              rekognition.detectFaces(params, function(err, data) {
                if (err) console.log(err, err.stack);
                else {
                  console.log(JSON.stringify(data, null, 5));
                }
              });
            }
          });

        console.log('--- stdout ---');
        console.log(me.stdout);
        console.error('--- stderr ---');
        console.error(me.stderr);
      });
  }, 5000);
}

