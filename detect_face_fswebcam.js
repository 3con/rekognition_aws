require('date-utils');

var dt = new Date();
var formatted = dt.toFormat("YYYYMMDDHH24MISS");


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
var file_name = './pic/fswebcam_' + formatted + '.jpg';
 
setInterval(function() {
  new execute(
      'fswebcam'
    , ['--no-banner', file_name]
    , function (me) {
      console.log('--- stdout ---');
      console.log(me.stdout);
      console.error('--- stderr ---');
      console.error(me.stderr);
    });

  var AWS = require("aws-sdk");
  var rekognition = new AWS.Rekognition({region: 'us-west-2'});
  var fs = require('fs');

  fs.readFile(file_name, function (err, data) {
    if (err) { console.log("error happend while read the file");}
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
},  5000);
