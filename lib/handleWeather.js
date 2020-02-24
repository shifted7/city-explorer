'use strict';

require('dotenv').config();
const client = require('./client');
const superagent = require('superagent');

function handleWeather(request,response){
    let queryLatitude = request.query.latitude;
    let queryLongitude = request.query.longitude;
    let sqlGet = 'SELECT * FROM forecasts WHERE latitude = $1 AND longitude = $2';
    let safeGetValues = [queryLatitude, queryLongitude];
    client.query(sqlGet, safeGetValues)
      .then(dbResult=>{
        let dbData = dbResult.rows;
        if(checkForecastDataIsNotOutdated(dbData)){ 
          response.send(dbData);
        } else{
          let url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${queryLatitude},${queryLongitude}`;
          superagent.get(url)
            .then(results=>{
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
  };
  
function DailyForecast(lat, lon, obj){
  this.latitude = lat;
  this.longitude = lon;
  this.forecast = obj.summary;
  this.time = new Date(obj.time * 1000).toDateString();
  this.retrieved = new Date().toUTCString();
}

function checkForecastDataIsNotOutdated(forecastData){
  const millisecondsInOneDay = 86400000;
  if(forecastData.length>0){
    let mostRecentForecast =forecastData[forecastData.length-1];
    if(new Date().getTime() - Date.parse(mostRecentForecast.retrieved) <= millisecondsInOneDay){
      return true;
    }
  }
  return false;
}

module.exports = handleWeather;