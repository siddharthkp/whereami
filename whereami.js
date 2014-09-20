var express = require('express');
var app     = express();
 
app.get('/places', function(req, res){
    var location = req.query.location;
    getPlaces(location, res);
});
 
app.listen('8081');
console.log('Magic happens on port 8081');
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
            var names = getNames(data);
            respond('names', names);
            if (data.results.length > 1) {
              getLocation(data.results[1].place_id);  
            } else {
              getLocation(data.results[0].place_id);
            }
        });
    }
    https.get(options, callback).end();

}

function getNames(data) {
  var names = [];
  for (i in data.results) {
    names.push(data.results[i].name);
  }
  return names;
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

var response = {
    'names': [],
    'address': null
}

function respond(type, value) {
    response[type] = value;
    if (response.names.length && response.address) {
      res.send(response);
    }
}
