var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var port = 5000;

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({   // to support URL-encoded bodies
  extended: true
}));

function getRoomStatus(room1, room2) {
  var status;

  if (room1 && room2) {
    status = 'Both rooms are occupied.';
  } else if (!room1 && !room2) {
    status = 'Both rooms are free.';
  } else {
    status = 'Room 1 is ' + (room1 ? 'occupied' : 'free') + '. Room 2 is ' + (room2 ? 'occupied' : 'free') + '.';
  }

  return status;
}

var room1 = false;
var room2 = false;
var status = getRoomStatus(room1, room2);

app.get('/', function (req, res) {
  res.send(status);
});

app.post('/', function (req, res) {
  if (!!req.body.room1) room1 = !room1;
  if (!!req.body.room2) room2 = !room2;

  status = getRoomStatus(room1, room2);

  console.log(status);
  res.send(status);
});

app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});
