var express = require('express');
var http = require('request');
var port = process.env.PORT || 5000;
var app = express();
 
app.get('/', function(request, response) {
    response.sendfile(__dirname + '/index.html');
});

app.get('/stats', function(request, response) {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	http({uri:'https://api.wheretheiss.at/v1/satellites/25544?units=miles',json:true}, function (error, res, body) {
    	if (!error && response.statusCode == 200) {
    		response.json(body);
		}
	});
});

app.configure(function() {
    app.use('/', express.static(__dirname + '/'));
});

app.listen(port);