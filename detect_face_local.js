var AWS = require("aws-sdk");
var rekognition = new AWS.Rekognition({region: 'us-west-2'});
var fs = require('fs');

var file = fs.readFile('./outan_confused04.JPG', function (err, data) {
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
      if (err) console.log(err, err.stack); // an error occurred
      else {
        console.log(JSON.stringify(data, null, 5));
      }
    });
  }
});


