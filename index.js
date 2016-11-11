var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var port = 3000;

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({   // to support URL-encoded bodies
  extended: true
}));

var room1 = false;
var room2 = false;
var status;

app.post('/', function (req, res) {
  if (!!req.body.room1) room1 = !room1;
  if (!!req.body.room2) room2 = !room2;

  if (room1 && room2) {
    status = 'Both rooms are occupied.';
  } else if (!room1 && !room2) {
    status = 'Both rooms are free.';
  } else {
    status = 'Room 1 is ' + (room1 ? 'occupied' : 'free') + '. Room 2 is ' + (room2 ? 'occupied' : 'free') + '.';
  }

  console.log(status);
  res.send(status);
});

app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});
