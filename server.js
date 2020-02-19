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
            response.status(500).send('Sorry, something went wrong');
        });
});

function City(city, obj){
    this.search_query = city;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat;
    this.longitude = obj.lon;
}

app.get('/weather', (request,response)=>{
    let weather = [];
    let latQuery = request.query.latitude;
    let lonQuery = request.query.longitude;
    let weatherData = require('./data/darksky.json');
    let dailyWeatherData = weatherData.daily.data;
    dailyWeatherData.forEach(day => {
        let newWeather = new Weather(day);
        weather.push(newWeather);
    })
    response.send(weather);
});

function Weather(obj){
    this.forecast = obj.summary;
    this.time = new Date(obj.time * 1000).toString().slice(0,15);
}

app.listen(PORT, ()=>{
    console.log(`listening on ${PORT}`);
});