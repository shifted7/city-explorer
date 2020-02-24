'use strict';

require('dotenv').config();
const superagent = require('superagent');

function handleMovies(request, response){
    let cityQuery = request.query.search_query;
    // https://api.themoviedb.org/3/search/movie?api_key=892a2d46f313ded29bee565c14ea20be&language=en-US&query=seattle&page=1&include_adult=false
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${cityQuery}`
    superagent.get(url)
      .then(results => {
        let movieResults = results.body.results.map(movie=>new Movie(movie));
        response.status(200).send(movieResults);
      })
      .catch(err=>{
          console.error(err);
          response.status(500).send(err);
        });
  }
  
function Movie(obj){
  this.title = obj.original_title;
  this.overview = obj.overview;
  this.average_votes = obj.vote_average;
  this.total_votes = obj.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${obj.poster_path}`;
  this.popularity = obj.popularity;
  this.released_on = obj.release_date;
}

module.exports = handleMovies;

