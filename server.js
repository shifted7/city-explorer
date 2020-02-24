'use strict'

const express = require('express');
const app = express();
require('dotenv').config();


const cors = require('cors');
app.use(cors());



const PORT = process.env.PORT || 3001;

// libraries
const client = require('./lib/client');
const handleLocation = require('./lib/handleLocation');
const handleWeather = require('./lib/handleWeather');
const handleYelp = require('./lib/handleYelp');
const handleMovies = require('./lib/handleMovies');
const handleTrails = require('./lib/handleTrails');

app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/yelp', handleYelp);
app.get('/movies', handleMovies);
app.get('/trails', handleTrails);


client.connect()
  .then(
    app.listen(PORT, ()=>{
      console.log(`listening on ${PORT}`);
    })
  )
  .catch(err=>{
    console.log('Error connecting');
    console.error(err);
    response.status(500).send(err);
  });