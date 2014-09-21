var request = require('request');
var express = require('express');
require('./stemmer.js');
var app     = express();

 
app.get('/alldishes', function(req, res){
  console.log('came here')
    var location = req.query.location;
    getPlaces(location, res);
});
 
app.listen('8087');
console.log('You are on port 8087');
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
            var place = {};
            if (!data.results.length) {
                res.send(null);
                return;
            }
            var places = data.results;
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
            var place = {
                name: places[0].name,
                location: places[0].vicinity
            }
            getMenuImages(place);
        }
    });
}

function getMenuImages(place) {
    console.log('fetching menu images');
    var url = 'http://localhost:8081/menuphotos?name=' + encodeURIComponent(place.name) + '&location=' + place.location;
    request(url, function (error, response, data) {
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        var menuImage = data.menuImages[0];
        getMeMenu(menuImage, place);
    });
}

function getMeMenu(menuImage, place) {
    var url = 'http://shifu.practodev.com/imagemenu?image_url=' + encodeURIComponent(menuImage);
    if (place.name === 'K & K') {
      url += '&kk=1';
    } else if (place.name === 'Moscow Mule') {
        url += '&mm=1';
    }
    request(url, function (error, response, data) {
        res.send({
          all_dishes: data
      });
    });
}
