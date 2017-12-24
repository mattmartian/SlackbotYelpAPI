/**
 * StAuth10065: I Matthew Martin, 000338807 certify that this material is my original work. No other person's work has been used without due acknowledgement.
 *  I have not made my work available to anyone else.
 */

var Bot = require("slackbots");
var https = require("https");
var querystring = require("querystring");

var yelptoken = "";

//Bot settings
var settings = {
  token: "", // Add a bot https://my.slack.com/services/new/bot and put the token
  name: ""
};

var bot = new Bot(settings);

bot.on('start', function(){
	bot.postMessageToChannel('general', 'Hello, There! How can I help you.');
});

bot.on('message', function(data){
    //If there is any data received from the api
    if(data.text != undefined) {
        //Search for Nearby  restaurants based on Address given in slack
        
        if (data.text.search('Nearby') > (-1)) {
            var location = data.text.substring(7);
            var myreq = {
                'location' : location,
                'limit': 5,
                'radius' : 10000,
            };
            nearBy(myreq);
        //Search for resteraunts close to the Co Ordinates given by the user in the slack channel
  
        }else if(data.text.search('Closeby') > (-1)){
            var split = data.text.split(" ",3);
            var lat = split[1];
            var lng = split[2];
            var myreq = {
                'latitude': lat,
                'longitude': lng,
                'sort_by': 'distance',
                'limit' : 5,
                'radius': 10000,
            }
            closeByLatLng(myreq);
        //Search for the top number of resteraunts given by the user in slack within 10km
        
        }else if(data.text.search('Top') > (-1)){
            var split = data.text.split(" ", 2);
            var leng = split[0] + split[1];
            var location = data.text.substring(leng.length + 1);
             var myreq = {
                'location' : location,
                'sort_by': 'rating',
                'limit': split[1],
                'radius' : 10000,
            };
            topAddresses(myreq);
        //Search for closest restaurants by an  address supplied by the user
       
        }else if(data.text.search('Closest') > (-1)){
            var split = data.text.split(" ", 2);
            var leng = split[0] + split[1];
            var location = data.text.substring(leng.length + 1);

            var myreq = {
                'location': location,
                'sort_by': 'distance',
                'limit': split[1],
            }
            closest(myreq);
            
        //Search for resteraunts by a category suypllied by the user
        }else if(data.text.search('FindMe') > (-1)){
            
            var split = data.text.split(" ", 2);
            var leng = split[0] + split[1];
            var location = data.text.substring(leng.length + 1);
            var myreq = {
                'location' : location,
                'radius': 20000,
                'categories': split[1].toLowerCase()
            };
            findMe(myreq, split[1]);


        //get reviews of a resteraunt
        }else if(data.text.search('Reviews') > (-1)){
            
            var split = data.text.split(/[0-9]/);
            var firstHalf = split[0];
            var location = data.text.substring(firstHalf.length + 1);

           
            var store = firstHalf.substring(7);
            var myreq = {
                'location' :  location,
                'term': store.toLowerCase(),
                'limit': 1
            };
            reviews(myreq, store);


        //Search for Address based on phone number given by the user in slack
        
        }else if(data.text.search('SearchByPhone') > (-1)){
            var phone = data.text.substring(14);
            var myreq = {
                'phone' : phone
            }
            searchByPhone(myreq, phone);
        }
    }
});


function nearBy(req){

    var myreqstr = querystring.stringify(req);
    var options = {
        host: 'api.yelp.com',
        port: '443',
        path: '/v3/businesses/search?' + myreqstr, // include the URL parameters
        method: 'get',
        headers : {
        'Authorization' : 'Bearer ' + yelptoken,
        }
    };
    cb = function(res){
        var str = '';

        res.on('data', function(chunk){
            str+= chunk;
        })
        res.on('end', function(){

            var data = JSON.parse(str);
            if(data.error === undefined){
                data.businesses.forEach(function(e){
                    bot.postMessageToChannel('general',`Name:  ${e.name} \n Location:  ${e.location.address1}, ${e.location.city}, ${e.location.state}, ${e.location.country}`);
                });
            }else{
                bot.postMessageToChannel('general', 'No nearby restaurants can be found');
            }
        });
    }
    https.request(options, cb).end();
}


function closeByLatLng(req){
    var myreqstr = querystring.stringify(req);
    var options = {
        host: 'api.yelp.com',
        port: '443',
        path: '/v3/businesses/search?' + myreqstr, // include the URL parameters
        method: 'get',
        headers : {
        'Authorization' : 'Bearer ' + yelptoken,
        }
    };
    cb = function(res){
        var str = '';

        res.on('data', function(chunk){
            str+= chunk;
        })
        res.on('end', function(){

            var data = JSON.parse(str);
            if(data.error === undefined){
                data.businesses.forEach(function(e){
                    bot.postMessageToChannel('general',`Name:  ${e.name} \n Location:  ${e.location.address1}, ${e.location.city}, ${e.location.state}, ${e.location.country}`);
                });
            }else{
                bot.postMessageToChannel('general', 'No closeby restaurants can be found');
            }
        });
    }
    https.request(options, cb).end();
}


function topAddresses(req){
    var myreqstr = querystring.stringify(req);
    var options = {
        host: 'api.yelp.com',
        port: '443',
        path: '/v3/businesses/search?' + myreqstr, // include the URL parameters
        method: 'get',
        headers : {
        'Authorization' : 'Bearer ' + yelptoken,
        }
    };
    cb = function(res){
        var str = '';

        res.on('data', function(chunk){
            str+= chunk;
        })
        res.on('end', function(){

            var data = JSON.parse(str);
            if(data.error === undefined){
                data.businesses.forEach(function(e){
                    bot.postMessageToChannel('general',`Name: ${e.name} \n Location: ${e.location.address1}, ${e.location.city}, ${e.location.state}, ${e.location.country} \n  Rating: ${e.rating}`);
                });
            }else{
                bot.postMessageToChannel('general', 'No nearby restaurants can be found');
            }
        });
    }
    https.request(options, cb).end();
}


function closest(req){
     var myreqstr = querystring.stringify(req);
        var options = {
            host: 'api.yelp.com',
            port: '443',
            path: '/v3/businesses/search?' + myreqstr, // include the URL parameters
            method: 'get',
            headers : {
            'Authorization' : 'Bearer ' + yelptoken,
            }
        };
        cb = function(res){
            var str = '';

            res.on('data', function(chunk){
                str+= chunk;
            })
            res.on('end', function(){

                var data = JSON.parse(str);
                if(data.error === undefined){
                    data.businesses.forEach(function(e){
                        bot.postMessageToChannel('general',`Name:  ${e.name} \n Location: ${e.location.address1}, ${e.location.city}, ${e.location.state}, ${e.location.country}`);
                    });
                }else{
                    bot.postMessageToChannel('general', 'No nearby restaurants can be found');
                }
            });
        }
        https.request(options, cb).end();
}


function findMe(req, category){
    var myreqstr = querystring.stringify(req);
    var options = {
        host: 'api.yelp.com',
        port: '443',
        path: '/v3/businesses/search?' + myreqstr, // include the URL parameters
        method: 'get',
        headers : {
        'Authorization' : 'Bearer ' + yelptoken,
        }
    };
    cb = function(res){
        var str = '';

        res.on('data', function(chunk){
            str+= chunk;
        })
        res.on('end', function(){

            var data = JSON.parse(str);
            if(data.error === undefined){
                data.businesses.forEach(function(e){
                    bot.postMessageToChannel('general',`Name: ${e.name} \n Address: ${e.location.address1}, ${e.location.city}, ${e.location.state}, ${e.location.country}\n Rating:  ${e.rating} \n`);
                });
            }else{
                bot.postMessageToChannel('general', `No  ${category} restaurants can be found`);
            }
        });
    }
    https.request(options, cb).end();

}


function reviews(req, store){
    var myreqstr = querystring.stringify(req);
    var options = {
        host: 'api.yelp.com',
        port: '443',
        path: '/v3/businesses/search?' + myreqstr, // include the URL parameters
        method: 'get',
        headers : {
            'Authorization' : 'Bearer ' + yelptoken,
        }
    };
    cb = function(res){
        var str = '';

        res.on('data', function(chunk){
            str+= chunk;
        })
        res.on('end', function(){

            var data = JSON.parse(str);
            if(data.error === undefined){
                if(data.businesses[0] === undefined){
                    bot.postMessageToChannel('general', `${store} cannot be found`);
                }else{
                    bot.postMessageToChannel('general', data.businesses[0].id);
                    getReviews(data.businesses[0].id, store);
                }
            }
        });
    }
    https.request(options, cb).end();
}


function getReviews(id, store){
    var options = {
        host: 'api.yelp.com',
        port: '443',
        path: '/v3/businesses/' + id + '/reviews',
        method: 'get',
        headers : {
            'Authorization' : 'Bearer ' + yelptoken,
        }
    }
    cb = function(res){
        var str = '';

        res.on('data', function(chunk){
            str+=chunk;
        })
        res.on('end', function(){

            var data = JSON.parse(str);

            if(data.error === undefined){
                data.reviews.forEach(function(e){
                    bot.postMessageToChannel('general', `${e.text} \n`)
                })
            }else{
                bot.postMessageToChannel('general', `${store} cannot be found`);
            }
        })
    }
    https.request(options,cb).end();
}


function searchByPhone(req, number){
    var myreqstr = querystring.stringify(req);

    var options = {
        host: 'api.yelp.com',
        port: '443',
        path: '/v3/businesses/search/phone?' + myreqstr,
        method: 'get',
        headers : {
        'Authorization' : 'Bearer ' + yelptoken,
        }
    }
    cb = function(res){
        var str = '';

        res.on('data', function(chunk){
            str += chunk;
        })
        res.on('end', function(){
            var data = JSON.parse(str);
            if(data.error === undefined){
                data.businesses.forEach(function(e){
                    bot.postMessageToChannel('general',`Name: \n ${e.name} \n Location: \n ${e.location.address1}, ${e.location.city}, ${e.location.state}, ${e.location.country}`);
                });
            }else{
                bot.postMessageToChannel('general', 'No restaurant with the phone number ${number} can be found');
            }
        })
    }
    https.request(options, cb).end();

}
console.log("Running...");



/******************************************************************************
 *
 * Use client_id (App ID) and client_secret (App Secret) to obtain an access
 * token for the YELP API.
 *
 ******************************************************************************/
callback = function(response) {
  var str = "";

  //another chunk of data has been recieved, so append it to `str`
  response.on("data", function(chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on("end", function() {
    var tokens = JSON.parse(str);

    // once we have the access token, make a request to the API
    yelptoken = (tokens.access_token);
  });
};

// setup request with app id, app secret
var authreq = {
  grant_type: "client_credentials",
  client_id: "", // put the App ID here,
  client_secret:
    "" // put the App secret here
};

var authreqstr = querystring.stringify(authreq);

var authoptions = {
  host: "api.yelp.com",
  port: "443",
  path: "/oauth2/token",
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  }
};

// send the post data
var req = https.request(authoptions, callback);
req.write(authreqstr);
req.end();
