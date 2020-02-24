'use strict';

require('dotenv').config();
const superagent = require('superagent');

function handleTrails(request, response){
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
};

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

module.exports = handleTrails;