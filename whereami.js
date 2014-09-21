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
var radius = 200;
var host = 'maps.googleapis.com';
var path = '/maps/api/place/nearbysearch/json?types=food' + '&key=' + key + '&radius=' + radius;


var res = null;
function getPlaces (location, responder) {
  res = responder;
  fetch(location);
}

function fetch(location) {
    console.log('fetching location');
    var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?types=food'; 
    url += '&key=' + key;
    url += '&radius=' + radius;
    url += '&location=' + location;
    request(url, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            data = JSON.parse(data);
            var places = [];
            if (!data.results.length) {
                res.send(places);
                return;
            }
            for (var i in data.results) {
                places.push({
                    name: data.results[i].name,
                    location: data.results[i].vicinity
                });
            }
            for (var i in places) {
                if (places[i].name === 'K & K' || places[i].name === 'Hunan') {
                    if (places[i].name === 'K & K') {
                        places[i].image_url = 'http://dc337.4shared.com/img/7flqsQgQ/s7/1415f54b180/06_k__k_itc_gardenia.jpg';
                    }
                    if (places[i].name === 'Hunan') {
                        places[i].name = 'Moscow Mule';
                    }
                    var temp = places[i];
                    places.splice(i, 1);
                    places.unshift(temp);
                }
            }
            if (!places[0].image_url) {
                console.log('fetching image');
                var imageUrl = 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=';
                imageUrl += encodeURI(places[0].name + ' bangalore'),
                request(imageUrl, function (error, response, data) {
                    data = JSON.parse(data);
                    places[0].image_url = data.responseData.results[0].url;
                    res.send({
                        'places': places,
                    });
                });
            } else {
                res.send({
                    'places': places,
                });
            }
        }
    });
}

