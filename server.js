'use strict'

const express = require('express');
const app = express();

require('dotenv').config();

const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 3001;

app.get('/locations', (request, response)=>{
    let cityQuery = request.query.city;
    let geoData = require('./data/geo.json');
    console.log(request);
    // response.send(location);
})

app.listen(PORT, ()=>{
    console.log(`listening on ${PORT}`);
})