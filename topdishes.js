var express = require('express');
require('./stemmer.js');
require('./menu.js');
var app     = express();
 
app.get('/topdishes', function(req, res){
    var location = req.query.location;
    getPlaces(location, res);
});
 
app.listen('8090');
console.log('Whats cooking at port 8090');
exports = module.exports = app;


//location = 12.9669362,77.5953564
var https = require('https');
var http = require('http');
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
            getLocation(place.place_id);
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
            getReviews(data.result.name, data.result.formatted_address);
        });
    }
    https.get(options, callback).end();
}

function getReviews(name, address) {
    var callback = function(response) {
        var data = '';
        response.on('data', function(chunk) {
            data += chunk;
        });
        response.on('end', function() {
            data = JSON.parse(data);
            reviews = data.reviews;
            giveMeFood(reviews);
        });
    }
    http.get('http://localhost:8081/about?name=' + name + '&location=' + address, callback).end();
}

function in_array (needle, haystack) {
  for (key in haystack) {
    if (haystack[key] == needle) {
      return true;
    }
  }
  return false;
}

var stopwords = ['1','2','3','4','5','6','7','8','9','0','one','two','three','four','five','about','actually','always','even','given','into','just','not','Im','thats','its','arent','weve','ive','didnt','dont','the','of','to','and','a','in','is','it','you','that','he','was','for','on','are','with','as','I','his','they','be','at','one','have','this','from','or','had','by','hot','but','some','what','there','we','can','out','were','all','your','when','up','use','how','said','an','each','she','which','do','their','if','will','way','many','then','them','would','like','so','these','her','see','him','has','more','could','go','come','did','my','no','get','me','say','too','here','must','such','try','us','own','oh','any','youll','youre','also','than','those','though','thing','things'];

function checkWords(input) {

  var words = input;
  var wordcount = {};

  for (i in words){
    thisWord = String(words[i]).replace(/[\/\\]/,' ').replace(/[^a-z' ]/gi,'').toLowerCase();
    if (!in_array(thisWord,stopwords)) {
      var word = stemmer(thisWord);
      if (wordcount[word] > 0 && word.length) {
        wordcount[word] += 1;
      } else {
        wordcount[word] = 1;
      }
    }
  };


    var topwords = new Array();
    
    for (var w in wordcount) {
        var i = wordcount[w];
        if (i > 1) topwords.push({'word':w,'freq':i});
    }

    topwordsArr = new Array();

    for (i in topwords) {
        topwordsArr.push(String(topwords[i]['word']));
    }

  return topwordsArr;
}

function getCombinations (input) {
  var words = input.split(' ');
  var combinations = [];
  var combination = '';
  for (var i = 0; i < words.length; i++) {
    for (var j = i; j < Math.min(i + 2, words.length); j++) {
      combination = '';
      for (var k = i; k <= j; k++) {
        combination += words[k] + ' ';
      }
      combinations.push(combination);
    }
  }
  for (i in combinations) {
    combinations[i] = combinations[i].substring(0, combinations[i].length - 1);
  }
  return combinations;
}

function filterMenuWords (words) {
  var menuItems = [];
  for (i in menu) {
    menu[i] = menu[i].toLowerCase();
  }
  for (var i in words)  {
    if (menu.indexOf(words[i]) != -1 && (menuItems.indexOf(words[i]) == -1)) {
      menuItems.push(words[i]);
    }
  }
  return menuItems;
}

function giveMeFood(reviews) {
    console.log('nom nom nom');
    reviews = reviews.join('. ');
    reviews = reviews.toLowerCase().replace(/:/g, '').replace(/!/g, '');
    var combinations = getCombinations(reviews);
    var menuWords = filterMenuWords(combinations);
    //var popularWords = checkWords(menuWords);
    var popularWords = menuWords;
    var dishes = [];
    for (i in popularWords) {
      dishes.push({
        name: popularWords[i]
      });
      addImages(dishes);
    }
}

function addImages(dishes) {
    console.log('adding le jazz');
    for (i in dishes) {
      var options = {
          host: 'ajax.googleapis.com',
          path: '/ajax/services/search/images?v=1.0&q=' + encodeURI(dishes[i].name + ' food'),
      };
      var callback = function(response) {
          var data = '';
          response.on('data', function(chunk) {
              data += chunk;
          });
          response.on('end', function() {
              data = JSON.parse(data);
              dishes[i].image_url = data.responseData.results[0].url;
              sendResponseIfAllSet(dishes);
          });
      }
      https.get(options, callback).end();
    }
}

function sendResponseIfAllSet(dishes) {
  for (i in dishes) {
    if (!dishes[i].image_url) {
      return;
    }
    console.log('send the goodies');
    res.send({
        top_dishes: dishes
    });
  }
}
