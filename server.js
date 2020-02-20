'use strict'

const express = require('express');
const app = express();
const pg = require('pg');

require('dotenv').config();

const cors = require('cors');
app.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err=>console.error(err));
const superagent = require('superagent');

const PORT = process.env.PORT || 3001;

app.get('/location', (request, response)=>{
  let cityQuery = request.query.city;
  console.log(cityQuery);
  
  let SQLget = 'SELECT * FROM locations WHERE search_query="seattle"';
  let safeValues = [cityQuery];
  client.query(SQLget)
    .then(results=>{
      console.log(results.rows);
    })
    .catch(err=>{
      console.error(err);
      response.status(500).send(err);
    });
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
  let queryLatitude = request.query.latitude;
  let queryLongitude = request.query.longitude;
  let url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${queryLatitude},${queryLongitude}`;
  superagent.get(url)
    .then(results=>{
      let weatherDataDaily = results.body.daily.data;
      let responseData = weatherDataDaily.map(day=>{
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
  this.time = new Date(obj.time * 1000).toDateString();
}

app.get('/trails', (request, response)=>{
  let queryLatitude = request.query.latitude;
  let queryLongitude = request.query.longitude;
  let url = `https://www.hikingproject.com/data/get-trails?lat=${queryLatitude}&maxResults=10&lon=${queryLongitude}&key=${process.env.TRAIL_API_KEY}`;
  superagent.get(url)
    .then(results=>{
      let trailsData = results.body.trails;
      let responseData = trailsData.map(trail=>{
        return new Trail(trail);
      });
      response.send(responseData);
    })
    .catch(err=>{
      console.error(err);
      response.status(500).send(err);
    });
})

function Trail(obj){
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionStatus;
  this.condition_date = obj.conditionDate.slice(0,10);
  this.condition_time = obj.conditionDate.slice(11,19);
}


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