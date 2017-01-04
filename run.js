require('dotenv').config();

var Particle = require('particle-api-js');
var particle = new Particle();

var q = require('q');

var Twitter = require('twitter');
var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var firstTweetId = '806346257425924096'; // pinned tweet, leave it alone

var leftRoomID = process.env.LEFT_ROOM_ID;
var rightRoomID = process.env.RIGHT_ROOM_ID;

var leftRoomOccupied = false;
var rightRoomOccupied = false;

function getRoomStatus(room1, room2) {
  var status;

  if (room1 && room2) {
    status = 'Both rooms are occupied.';
  } else if (!room1 && !room2) {
    status = 'Both rooms are available.';
  } else {
    status = 'Zen Room 1 is ' + (room1 ? 'occupied' : 'available') + '. Zen Room 2 is ' + (room2 ? 'occupied' : 'available') + '.';
  }

  return status;
}

function getStatus(token) {
  console.log('Running...');

  leftPr = particle.getDevice({ deviceId: leftRoomID, auth: token });
  rightPr = particle.getDevice({ deviceId: rightRoomID, auth: token });

  q.all([leftPr, rightPr]).then(
    function(deviceData) {
      for (var i = 0; i < deviceData.length; i++) {
        var body = deviceData[i].body;

        if (body.id == leftRoomID) {
          leftRoomOccupied = !!body.connected;
        }

        if (body.id == rightRoomID) {
          rightRoomOccupied = !!body.connected;
        }
      }

      var roomStatus = getRoomStatus(leftRoomOccupied, rightRoomOccupied);

      client.get('statuses/user_timeline', function(error, tweets, response) {
        if (error) {
          try {
            console.log('Error getting timeline: ' + error[0].message);
          } catch(ex) {
            console.log('Error getting timeline: ' + ex);
          }
        }

        try {
          tweets.forEach(function(tweet, index) {
            if (index === 0) { // if it's the most recent tweet
              if (tweet.text != roomStatus) { // and it is different from current status, delete
                console.log('Status has changed. Destroying old tweet.');
                client.post('statuses/destroy/' + tweet.id_str, function(error, tweet, response) {
                  if (error) console.log('Error destroying tweet: ' + error[0].message);
                });

                client.post('statuses/update', { status: roomStatus }, function(error, tweet, response) {
                  if (error) {
                    console.log('Error tweeting "' + roomStatus + '": ' + error[0].message);
                  } else {
                    console.log('Successfully tweeted "' + tweet.text + '".');
                  }
                });
              } else {
                console.log('Status has not changed'); // leave it alone
              }
            } else {
              // delete all other tweets (there shouldn't ever be more than one)
              if (tweet.id_str !== firstTweetId) { // don't delete pinned tweet
                console.log('Deleting old tweet ' + tweet.id_str);
                client.post('statuses/destroy/' + tweet.id_str, function(error, tweet, response) {
                  if (error) console.log('Error destroying tweet: ' + error[0].message);
                });
              }
            }
          });
        } catch(ex) {
          console.log('Error iterating over tweets: ' + ex);
        }
      });
    },
    function(error) {
      console.log('Error getting device status: ' + error);
    }
  );
}

function run() {
  var unescapedPassword = process.env.PARTICLE_PASS.replace('\\', ''); // ¯\_(ツ)_/¯
  particle.login({username: process.env.PARTICLE_USER, password: unescapedPassword}).then(
    function(data) {
      var token = data.body.access_token;
      var devicesPr = particle.listDevices({ auth: token });
      console.log('Successfully logged in.');

      getStatus(token);
      setInterval(function() { getStatus(token) }, 1000 * 60); // run every minute
    },
    function(error) {
      console.log('API call completed on promise fail: ', error);
    }
  );
}

run();
