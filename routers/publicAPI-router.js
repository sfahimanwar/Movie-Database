//This router file handles requests for the PUBLIC JSON API
const express = require("express");
const model = require("../business_logic.js");
let router = express.Router();

//GET request handler for a specific movie with movie parameter, parameter is movie name
router.get("/movies/:movie", function (req, res) {
  let movieParam = req.params.movie;
  let movieObj = model.getMovieByName(movieParam);
  let objCopy = Object.assign({}, movieObj);
  if (objCopy != null) {
    objCopy.reviews = model.getMoviesReviews(
      model.getMovieByName(movieParam).movieID
    );
  }
  res.json(objCopy);
});

//GET request handler for a specific user with user parameter, parameter is the username
router.get("/users/:user", function (req, res) {
  let userParam = req.params.user;
  let userObj = model.getUserByName(userParam);
  let objCopy = Object.assign({}, userObj);
  if (objCopy != null) {
    objCopy.reviews = model.getUsersReviews(
      model.getUserByName(userParam).userID
    );
  }
  let accountType;
  let newUserObj;

  if (objCopy != null) {
    if (objCopy.isContributing === false) {
      accountType = "Regular";
    } else {
      accountType = "Contributing";
    }
    newUserObj = {
      userID: objCopy.userID,
      username: objCopy.username,
      accountType: accountType,
      reviews: objCopy.reviews,
    };
  }
  res.json(newUserObj);
});

//GET request handler for a specific person with person parameter, parameter is the persons name
router.get("/people/:person", function (req, res) {
  let personParam = req.params.person;
  let personObj = model.getPersonByName(personParam);
  let objCopy = Object.assign({}, personObj);
  if (objCopy != null) {
    objCopy.movies = model.getPersonsMovies(objCopy.peopleID);
  }
  res.json(objCopy);
});

//GET request for all people in the database
router.get("/people", function (req, res) {
  let found = [];
  //Uses Regex to check if theres a ? for a query parameter and if not sends all the people
  if (!/\?.+/.test(req.url)) {
    for (let i = 0; i < model.people.length; i++) {
      found.push(model.people[i].name);
    }
  } else {
    let temp = model.searchPeople(req.query.name);
    if (temp != null) {
      for (let i = 0; i < temp.length; i++) {
        found.push(temp[i].name);
      }
    }
  }
  res.json(found);
});

//GET requests for all the users in the application
router.get("/users", function (req, res) {
  let found = [];
  //Uses Regex to check if theres a ? for a query parameter and if not sends all the users
  if (!/\?.+/.test(req.url)) {
    for (let i = 0; i < model.users.length; i++) {
      found.push(model.users[i].username);
    }
  } else {
    let temp = model.searchUsers(req.query.name);
    if (temp != null) {
      for (let i = 0; i < temp.length; i++) {
        found.push(temp[i].username);
      }
    }
  }
  res.json(found);
});

//GET requests for all the movies in the application
router.get("/movies", function (req, res) {
  let found = [];
  //Uses Regex to check if theres a ? for a query parameter and if not sends all the movies
  if (!/\?.+/.test(req.url)) {
    found = model.movies.map((elem) => elem.title);
  } else {
    found = model
      .getMoviesByQueryParameters(
        req.query.title,
        req.query.genre,
        req.query.year,
        req.query.minrating
      )
      .map((elem) => elem.title);
  }
  res.json(found);
});

//POST request for adding movie to the database. Movie data is sent in the body in JSON form. Format that is required is specified
//in the README
router.post("/movies", function (req, res) {
  if (
    model.addMovieAPI(
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
    res.json(model.getMovieByName(req.body.title));
  } else {
    res
      .status(400)
      .send("Invalid JSON Data or movie already exists. Follow documentation.");
  }
});

module.exports = router;
