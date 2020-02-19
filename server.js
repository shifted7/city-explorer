'use strict'

const express = require('express');
const app = express();

require('dotenv').config();

const cors = require('cors');
app.use(cors());

const superagent = require('superagent');

const PORT = process.env.PORT || 3001;

app.get('/location', (request, response)=>{
  let cityQuery = request.query.city;
  let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${cityQuery}&format=json`;
  superagent.get(url)
    .then(results=>{
      let geoData = results.body;
      let newCity = new City(cityQuery, geoData[0]);
      response.send(newCity);
    })
    .catch(err=>{
      console.error(err);
      response.status(500).send(err);
    });
});

function City(city, obj){
  this.search_query = city;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

app.get('/weather', (request,response)=>{
  //let weatherData = require('./data/darksky.json');
  let queryLatitude = request.query.latitude;
  let queryLongitude = request.query.longitude;
  let url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${queryLatitude},${queryLongitude}`;
  superagent.get(url)
    .then(results=>{
      let weatherDataDaily = results.body.daily.data;
      let responseData = weatherDataDaily.map(day => {
        return new Weather(day);
      });
      response.send(responseData);
    })
    .catch(err=>{
      console.error(err);
      response.status(500).send(err);
    });
});

function Weather(obj){
  this.forecast = obj.summary;
  this.time = new Date(obj.time * 1000).toString().slice(0,15);
}

app.listen(PORT, ()=>{
  console.log(`listening on ${PORT}`);
});