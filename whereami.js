var request = require('request');
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
var key = 'AIzaSyArBmLVB_OqHZAiQo7zoSzbnAiDjkPZ03o';
var radius = 25;
var host = 'maps.googleapis.com';
var path = '/maps/api/place/nearbysearch/json?types=food' + '&key=' + key + '&radius=' + radius;


var res = null;
function getPlaces (location, responder) {
  res = responder;
  fetch(location);
}

function fetch(location) {
    var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?types=food'; 
    url += '&key=' + key;
    url += '&radius=' + radius;
    url += '&location=' + location;
    request(url, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            data = JSON.parse(data);
            var place;
            if (data.results.length > 1) {
                place = data.results[1];
            } else {
                place = data.results[0];
            }
            if (!place) {
                res.send(null);
            }
            var name = place.name;
            res.send({
                'name': name
            });
        }
    });
}
