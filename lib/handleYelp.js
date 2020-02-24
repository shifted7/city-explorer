'use strict';

require('dotenv').config();
const superagent = require('superagent');

function handleYelp(request, response){
    let cityQuery = request.query.search_query;
    let url = `https://api.yelp.com/v3/businesses/search?location=${cityQuery}`;
    superagent.get(url)
      .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
      .then(results => {
        let yelpResults = results.body.businesses.map(business=>new Yelp(business));
        response.status(200).send(yelpResults);
      })
      .catch(err=>{
        console.error(err);
        response.status(500).send(err);
      });
  }
  
  function Yelp(obj){
    this.name = obj.name;
    this.image_url = obj.image_url;
    this.price = obj.price;
    this.rating = obj.rating;
    this.url = obj.url;
  }

  module.exports = handleYelp;