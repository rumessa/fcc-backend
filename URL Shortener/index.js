require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const URL = require('url').URL;
const mongoose = require('mongoose');
const app = express();
let id = 0;

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// connect to the database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('connected', () => console.log('connected'));

// creating an instance from a mongoose schema
const urlsSchema = mongoose.Schema({
  longURL: { type: String, required: true },
  shortURL: { type: Number, required: true }
});
const URLs = mongoose.model("URLs", urlsSchema);

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// create a new document and save
saveDoc = (url, id, done) => {
  console.log("Id inside evthing: " + id);
  let newDoc = new URLs({
    longURL: url,
    shortURL: id
  });

  newDoc.save((err, data) => {
    if (err) return console.log(err);
    done(null, data);
  })
}

// get data from post req
app.post('/api/shorturl', (req, res) => {
  const url = new URL(req.body.url);

  dns.lookup(url.hostname, (err, address, family) => {
    // hostname invalid
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    // hostname valid then
    else {
      // find if already exists in db
      URLs.findOne({ longURL: url }, (error, result) => {
        if (error) {
          console.log(error)
        }
        else {
          // doesn't exist, then save
          if (result === null) {
            console.log("Id before evthing: " + id);
            saveDoc(req.body.url, id, (err, data) => {
              if (err) console.error(err);
              console.log('Saved');
            });
            res.json({
              "original_url": req.body.url,
              "short_url": id
            });
            id = id + 1;
            console.log("Id after evthing: " + id);
          }
          // does exist then return short url
          else {
            return res.json({
              "original_url": req.body.url,
              "short_url": result.shortURL
            });
          }
        }
      });
    }

  });
});

// the short url redirection
app.get('/api/shorturl/:id', (req, res) => {
  const { id } = req.params;
  URLs.findOne({ shortURL: id }, (err, result) => {
    if (err) {
      return res.json({ error: 'invalid' });
    }
    else {
      if (result === null) {
        return res.json({ error: 'no short url exists' });
      }
      else {
        res.redirect(result.longURL);
      }
    }
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


exports.URLs = URLs;
exports.saveDoc = saveDoc;

// lacks primary key so original urls can have same short urls. need to fix that.