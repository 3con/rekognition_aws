var request = require('request').defaults({ encoding: null });;
var AWS = require("aws-sdk");     
var rekognition = new AWS.Rekognition({region: 'us-west-2'});

request.get('http://pumpkiiin.com/wp-content/uploads/2016/03/img01-3.jpg', function (error, response, body) {
 if (!error && response.statusCode == 200) {
     var params = {
     Image: {
         Bytes: body
     },
  };

  rekognition.detectFaces(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(JSON.stringify(data, null, 5));           // successful response
  });
}
});    
