var express = require('express');
var app     = express();
 
app.get('/whereami', function(req, res){
    var location = req.query.location;
    getPlaces(location, res);
});
 
app.listen('8089');
console.log('You are on port 8089');
exports = module.exports = app;


//location = 12.9669362,77.5953564
var https = require('https');
var key = 'AIzaSyArBmLVB_OqHZAiQo7zoSzbnAiDjkPZ03o';
var radius = 25;
var host = 'maps.googleapis.com';
var path = '/maps/api/place/nearbysearch/json?types=food' + '&key=' + key + '&radius=' + radius;


var res = null;
function getPlaces (location, responder) {
  res = responder;
  path += '&location=' + location;
    var options = {
        host: host,
        path: path,
    };
  fetch(options);
}

function fetch(options) {
    var callback = function(response) {
        var data = '';
        response.on('data', function(chunk) {
            data += chunk;
        });
        response.on('end', function() {
            data = JSON.parse(data);
            if (data.results.length > 1) {
                place = data.results[1];
            } else {
                place = data.results[0];
            }
            var name = place.name;
            respond('name', name);
            getLocation(place.place_id);
            //getImage(name);
        });
    }
    https.get(options, callback).end();
}

function getLocation(placeId) {
    var path = '/maps/api/place/details/json?placeid=' + placeId + '&key=' + key;
    var options = {
        host: host,
        path: path
    };
    var callback = function(response) {
        var data = '';
        response.on('data', function(chunk) {
            data += chunk;
        });
        response.on('end', function() {
            data = JSON.parse(data);
            respond('address', data.result.formatted_address);
        });
    }
    https.get(options, callback).end();
}

function getImage(name) {
    var options = {
        host: 'localhost',
        path: '/about?name=' + name + '&location=' + address,
        port: 8081
    };
    var callback = function(response) {
        var data = '';
        response.on('data', function(chunk) {
            data += chunk;
        });
        response.on('end', function() {
            image_url = data.image_url;
            respond('image_url', image_url);
        });
    }
    https.get(options, callback).end();
}

var response = {
    name: null,
    address: null,
    image_url: null
}

function respond(type, value) {
    response[type] = value;
    //if (response.name && response.address && response.image_url) {
    if (response.name && response.address) {
      res.send(response);
    }
}
