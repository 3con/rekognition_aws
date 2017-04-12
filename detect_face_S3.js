var AWS = require("aws-sdk");
var rekognition = new AWS.Rekognition({region: 'us-west-2'});

var params = {
  Image: {
    S3Object: {
      Bucket: "node-sdk-sample-1bdafef2-f2b3-4a78-82f6-b96ffc9f0849",
      Name: "girl.jpg"
    }
  }
};

rekognition.detectFaces(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else {
    console.log(JSON.stringify(data, null, 5));
  }
});

