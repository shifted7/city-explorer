'use strict'

const express = require('express');
const app = express();

require('dotenv').config();

const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 3001;

app.get('/location', (request, response)=>{
    try{
    let cityQuery = request.query.city;
    let geoData = require('./data/geo.json');
    let newCity = new City(cityQuery, geoData[0]);
    console.log(requesttt);
    console.log(newCity);
    response.send(newCity);
    }
    catch (err){
        response.status(500).send('Sorry, something went wrong');
    }
})

function City(city, obj){
    this.search_query = city;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat;
    this.longitude = obj.lon;
}

app.get('/weather', (request,response)=>{
    try{
    let weather = [];
    let latQuery = request.query.latitude;
    let lonQuery = request.query.longitude;
    let weatherData = require('./data/darksky.json');
    let dailyWeatherData = weatherData.daily.data;
    dailyWeatherData.forEach(day => {
        let newWeather = new Weather(day);
        console.log(newWeather);
        weather.push(newWeather);
    })
    response.send(weather);
    } catch(err){
        response.status(500).send('Sorry, something went wrong');
    }

})

function Weather(obj){
    this.forecast = obj.summary;
    this.time = new Date(obj.time * 1000).toString().slice(0,15);
}

function Error(obj){
    this.status=500;
    this
}

app.listen(PORT, ()=>{
    console.log(`listening on ${PORT}`);
})