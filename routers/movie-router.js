//Handles routes that involve movies
const express = require("express");
const model = require("../business_logic.js");
let router = express.Router();

//GET handler for a specific movie page, uses movie name as a parameter
router.get("/:movie", function (req, res) {
  let loggedIn = req.session.loggedIn;
  let url = req.url;
  let user = model.getUserByID(req.session.userID);
  let userCopy = Object.assign({}, user);
  let movieParam = req.params.movie;
  let movieObj = model.getMovieByName(movieParam);
  if (movieObj === undefined) {
    res.status(404).send("Movie doesn't exist");
  } else {
    //Makes a copy of the movie object so as not to overwrite actual data when adding the reviews
    //Since JS uses pass by reference
    let objCopy = Object.assign({}, movieObj);
    objCopy.reviews = model.getMoviesReviews(objCopy.movieID);
    //Rounds the average rating to 1 decimal place
    objCopy.averageRating = objCopy.averageRating.toFixed(1);
    res.render("movie", { loggedIn, url, objCopy, userCopy });
  }
});

//POST request handler for adding a new movie in the contributing page which user can access through the profile
//Movie data is sent through an HTML form
router.post("/addMovie", function (req, res) {
  if (
    model.addMovie(
      req.session.userID,
      req.body.title,
      req.body.year,
      req.body.runtime,
      req.body.plot,
      req.body.genre1,
      req.body.genre2,
      req.body.actor1,
      req.body.actor2,
      req.body.actor3,
      req.body.director,
      req.body.writer
    )
  ) {
    //redirects to the movie page of the movie added if it was successful
    res.redirect("/movie/" + req.body.title);
  } else {
    //If adding the movie failed
    res
      .status(400)
      .send(
        "Adding movie failed. Either movie already exists or the people in the movie added are not in the database"
      );
  }
});

//Handler for the search function, when user types into the search box and clicks the button
router.post("/search", function (req, res) {
  let loggedIn = req.session.loggedIn;
  let url = req.url;
  let searchResults = model
    .searchMovie(req.body.searchQuery)
    .map((elem) => elem.title);
  let searchObj = {
    searchResults: searchResults,
    searchQuery: req.body.searchQuery,
    length: searchResults.length,
  };
  res.render("search", { url, loggedIn, searchObj });
});

//Shows search results for a specific genre, its used when use clicks on a genre keyword on a movie page
router.get("/genreSearch/:genre", function (req, res) {
  let loggedIn = req.session.loggedIn;
  let url = req.url;
  let genreParam = req.params.genre;
  let searchResults = model.searchByGenre(genreParam).map((elem) => elem.title);
  let searchObj = {
    searchResults: searchResults,
    searchQuery: genreParam,
    length: searchResults.length,
  };
  res.render("search", { url, loggedIn, searchObj });
});

module.exports = router;
