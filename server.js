require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const store = require('./store.js');
const helmet = require('helmet');

const app = express();

app.use(morgan('common'));
app.use(helmet());
app.use(cors());
app.use(validateBearer);

//Grab API key from environment
const API_SECRET = process.env.API_SECRET;


//Validates API key
function validateBearer(req, res, next) {
  const authVal = req.get('Authorization') || '';
  if(!authVal.startsWith('Bearer ')) {
    return res.status(400).json({ error: 'Authorization token not found'});
  }

  const token = authVal.split(' ')[1];
  if (token !== API_SECRET) {
    return res.status(401).json({ error: 'Token is invalid'});
  }
  next();
}


//Sends back data when browser looks at /movie endpoint
app.get('/movie', (req, res) => {
  let filtered = [...store];
  let genre = req.query.genre;
  let country = req.query.country;
  let avgScore = parseInt(req.query.avg_vote);

  //checks if genre filter parameter was sent by user and filters original list
  if(genre) {
    filtered = filtered.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase()));
  }

  //checks if country filter parameter was sent by user and filters list
  if(country) {
    filtered = filtered.filter(movie => movie.country.toLowerCase().includes(country.toLowerCase()));
  }

  //checks if avg_vote parameter was sent by user and filters list
  if(avgScore) {
    filtered = filtered.filter(movie => movie.avg_vote >= avgScore );
  }

  //returns list based on necessary filters, if no filters, returns entire list
  res.json(filtered);
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});