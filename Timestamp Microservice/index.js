// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
const e = require('express');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/:date_string?", (req, res) => {
  const { date_string } = req.params;

  // data param exists
  if (date_string !== undefined) {
    // date provided
    if (isNaN(date_string)) {
      let date = new Date(date_string);

      // check if invalid string
      if (date.toString() === "Invalid Date") {
        return res.json({
          error: "Invalid Date"
        })
      }
      return res.json({
        "unix": date.getTime(),
        "utc": date.toUTCString()
      });
    }
    // unix timestamp provided
    else {
      let unix = Number(date_string);
      return res.json({
        "unix": unix,
        "utc": new Date(unix).toUTCString()
      });
    }
  }
  // date param does not exist 
  else {
    date = new Date();
    return res.json({
      "unix": date.getTime(),
      "utc": date.toUTCString()
    });
  }
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});



  // null to check for empty. 
  // undefined to check for nonexistent