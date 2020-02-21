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
  let sqlGet = 'SELECT * FROM locations WHERE search_query = $1';
  let safeGetValues = [cityQuery];
  client.query(sqlGet, safeGetValues)
    .then(dbResults=>{
      if(dbResults.rowCount>0){
        console.log('Location data found in db.');
        let dbData = dbResults.rows[0];
        response.send(dbData);
      } else{
        console.log('Location data not found in db, getting from API...');
        let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${cityQuery}&format=json`;
        superagent.get(url)
          .then(apiResults=>{
            let geoData = apiResults.body;
            let newCity = new City(cityQuery, geoData[0]);
            let sqlSend = 'INSERT INTO locations(search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';
            let safeSendValues = [newCity.search_query, newCity.formatted_query, newCity.latitude, newCity.longitude];
            client.query(sqlSend, safeSendValues);
            response.send(newCity);
          })
      }
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
  let sqlGet = 'SELECT * FROM forecasts WHERE latitude = $1 AND longitude = $2';
  let safeGetValues = [queryLatitude, queryLongitude];
  client.query(sqlGet, safeGetValues)
    .then(dbResults=>{
      
      if(dbResults.rows.length>0){
        console.log('Weather data found in db.');
        let dbData = dbResults.rows;
        response.send(dbData);
      } else{
        let url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${queryLatitude},${queryLongitude}`;
        superagent.get(url)
          .then(results=>{
            console.log('Weather data not found in db, getting from API...');
            let responseLat = results.body.latitude;
            let responseLon = results.body.longitude;
            let weatherDataDaily = results.body.daily.data;
            let responseData = weatherDataDaily.map(day=>{
              return new DailyForecast(responseLat, responseLon, day);
            });
            let sqlSend = 'INSERT INTO forecasts(latitude, longitude, forecast, time, retrieved) VALUES ($1, $2, $3, $4, $5);';
            responseData.forEach((forecast)=>{
              let safeSendValues = [forecast.latitude, forecast.longitude, forecast.forecast, forecast.time, forecast.retrieved];
              client.query(sqlSend, safeSendValues);
            })
            response.send(responseData);
          })
      }
    })
    .catch(err=>{
      console.error(err);
      response.status(500).send(err);
    });
});

function DailyForecast(lat, lon, obj){
  this.latitude = lat;
  this.longitude = lon;
  this.forecast = obj.summary;
  this.time = new Date(obj.time * 1000).toDateString();
  this.retrieved = new Date().toUTCString();
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