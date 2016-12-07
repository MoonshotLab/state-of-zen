var env = require('./env-config.js')();

var Particle = require('particle-api-js');
var particle = new Particle();

var q = require('q');

var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: env.TWITTER_CONSUMER_KEY,
  consumer_secret: env.TWITTER_CONSUMER_SECRET,
  access_token_key: env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: env.TWITTER_ACCESS_TOKEN_SECRET
});

var leftRoomID = env.LEFT_ROOM_ID;
var rightRoomID = env.RIGHT_ROOM_ID;

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
  var update = false;

  leftPr = particle.getDevice({ deviceId: leftRoomID, auth: token });
  rightPr = particle.getDevice({ deviceId: rightRoomID, auth: token });

  q.all([leftPr, rightPr]).then(
    function(deviceData) {
      for (var i = 0; i < deviceData.length; i++) {
        var body = deviceData[i].body;

        if (body.id == leftRoomID) {
          if (leftRoomOccupied != !!body.connected) {
            update = true;
            leftRoomOccupied = !!body.connected;
          }
        }

        if (body.id == rightRoomID) {
          if (rightRoomOccupied != !!body.connected) {
            update = true;
            rightRoomOccupied = !!body.connected;
          }
        }

      }

      if (update) {
        var roomStatus = getRoomStatus(leftRoomOccupied, rightRoomOccupied);

        client.post('statuses/update', { status: roomStatus }, function(error, tweet, response) {
          if (error) {
            console.log('Error tweeting: ' + error[0].message);
          } else {
            console.log('Successfully tweeted.');
          }
        });
      } else {
        console.log('No update.');
      }
    },
    function(err) {
      console.log(err);
    }
  );
}

console.log('Attempting to log in with user ' + env.PARTICLE_USER + ' and password ' + env.PARTICLE_PASS + '.');
particle.login({username: env.PARTICLE_USER, password: env.PARTICLE_PASS}).then(
  function(data) {
    var token = data.body.access_token;
    var devicesPr = particle.listDevices({ auth: token });
    console.log('Successfully logged in.');

    getStatus(token);
    setInterval(function() { getStatus(token) }, 1000 * 60); // run every minute
  },
  function(err) {
    console.log('API call completed on promise fail: ', err);
  }
);
