var AWS = require("aws-sdk");
var rekognition = new AWS.Rekognition({region: 'us-west-2'});
var fs = require('fs');

if (process.argv.length < 3) {
  console.log("usage: node index.js filename");
  process.exit();
} else {
  file_name = process.argv[2];
}

var file = fs.readFile(file_name, function (err, data) {
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
