//Handles routes that involve people
const express = require("express");
const model = require("../business_logic.js");
let router = express.Router();

//GET request handler for a specific person's page, has a person parameter
router.get("/:person", function (req, res) {
  let loggedIn = req.session.loggedIn;
  let url = req.url;
  let personParam = req.params.person;
  //Gets the person object using the model's function
  let personObj = model.getPersonByName(personParam);
  //Is the user following the person, used for rendering of the follow/unfollow button on the pug page
  let isFollowing = false;
  if (personObj === undefined) {
    res.status(404).send("Person doesn't exist");
  } else {
    //If user follows this person isFollowing is set to true
    if (
      model
        .getUserByID(req.session.userID)
        .followingPeople.includes(personObj.peopleID)
    ) {
      isFollowing = true;
    }
    //Creates a copy of the object so as not to overwrite the original object as references are being used
    let objCopy = Object.assign({}, personObj);
    //Creates a new isFollowing property for the object
    objCopy.isFollowing = isFollowing;
    objCopy.movies = model.getPersonsMovies(personObj.peopleID);
    //Gets only 5 of their collaborators
    objCopy.collaborators = personObj.collaborators.slice(0, 5);
    res.render("people", { url, loggedIn, objCopy });
  }
});

//PUT handler for following a person by clicking the button on their profile
router.put("/followPerson", function (req, res) {
  if (
    model.followPerson(
      req.session.userID,
      model.getPersonByName(req.body.name).peopleID
    ) === true
  ) {
    res.status(200).send("Unfollow");
  } else {
    res.status(404).send("Failed");
  }
});

//PUT handler for unfollowing a person by clicking the button
router.put("/unfollowPerson", function (req, res) {
  if (
    model.unfollowPerson(
      req.session.userID,
      model.getPersonByName(req.body.name).peopleID
    ) === true
  ) {
    res.status(200).send("Follow");
  } else {
    res.status(404).send("Failed");
  }
});

//POST request handler for adding a new person in the contributing page which user can access through the profile
//Person data is sent through an HTML form
router.post("/addPerson", function (req, res) {
  if (model.addPerson(req.session.userID, req.body.name, req.body.role)) {
    //redirects to the page of the person added if it was successful
    res.redirect("/people/" + req.body.name);
  } else {
    //If the person already exists in the database
    res.status(400).send("Person already exists in the database");
  }
});

module.exports = router;
