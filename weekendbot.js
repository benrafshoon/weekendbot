var twitterAPI = require("node-twitter-api");
var schedule = require("node-schedule");

var twitter = new twitterAPI({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callback: "http://127.0.0.1:3000/twitterLoggedIn"
});

var requestToken;
var requestTokenSecret;

twitter.getRequestToken(function(error, token, tokenSecret, results) {
  if(error) {
    console.log("Error getting OAuth request token: " + error);
  } else  {
    requestToken = token;
    requestTokenSecret = tokenSecret;
    console.log("Got request token " + requestToken + " " +requestTokenSecret);
  }
});

var express = require("express");

var app = express();





var user;

var statuses = [
  "Cha cha!",
  "Unicooooorn!"
]

function pickStatus() {
  var index = Math.floor(Math.random() * 2);
  return statuses[index];
}

function scheduleTasks() {
  var rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [5, 6];
  rule.hour = 20;
  rule.minute = 0;
  var task = schedule.scheduleJob(rule, function() {
    postStatus(pickStatus());
  });
}

function postStatus(status) {
  twitter.statuses("update", {
    status: status
  },
  user.accessToken,
  user.accessTokenSecret,
  function(error, data, response) {
    if(error) {
      console.log(error);
    } else {
      console.log("" + new Date() + " | Posted status | " + status);
    }
  });
}

app.get("/login", function(request, response) {
  response.redirect(twitter.getAuthUrl(requestToken));
});

app.get("/twitterLoggedIn", function(request, response) {
  if(!request.query.oauth_token || !request.query.oauth_verifier) {
    response.send(404);
  }

  oauthToken = request.query.oauth_token;
  oauthVerifier = request.query.oauth_verifier;

  twitter.getAccessToken(requestToken, requestTokenSecret, oauthVerifier, function(error, accessToken, accessTokenSecret, results) {
    if(error) {
      console.log(error);
      response.send(500, "Error getting twitter access token");
    } else {
      console.log("authorized");

      twitter.verifyCredentials(accessToken, accessTokenSecret, function(error, data, results) {
        if(error) {

          response.send(500, "Error downloading user info");
          console.log(error);
        } else {
          console.log("Logged in as " + data.screen_name);
          user = {
            accessToken: accessToken,
            accessTokenSecret: accessTokenSecret
          }

          response.send("Logged in as " + data.screen_name);

          scheduleTasks();

        }
      });
    }
  })
});




var server = app.listen(3000, function() {
  var host = server.address().address
  var port = server.address().port
  console.log("Weekendbot running on " + host + ":" + port);
});
