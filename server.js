'use strict'

const express = require('express');
const app = express();

require('dotenv').config();

const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 3001;

app.get('/locations', (request, response)=>{
    try{
    let cityQuery = request.query.city;
    let geoData = require('./data/geo.json');
    let newCity = new City(cityQuery, geoData[0]);

    response.send(newCity);
    }
    catch (err){
        console.log(request);
        console.log(err);
    }
})

function City(city, obj){
    this.search_query = city;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat;
    this.longitude = obj.lon;
}

app.listen(PORT, ()=>{
    console.log(`listening on ${PORT}`);
})