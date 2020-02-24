'use strict';

require('dotenv').config();
const client = require('./client');
const superagent = require('superagent');

function handleLocation(request, response){
    let cityQuery = request.query.city;
    let sqlGet = 'SELECT * FROM locations WHERE search_query = $1';
    let safeGetValues = [cityQuery];
    client.query(sqlGet, safeGetValues)
      .then(dbResults=>{
        if(dbResults.rowCount>0){
          let dbData = dbResults.rows[0];
          response.send(dbData);
        } else{
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
  };
  
  function City(city, obj){
    this.search_query = city;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat;
    this.longitude = obj.lon;
  }

  module.exports=handleLocation;