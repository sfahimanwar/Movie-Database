//Handles routes that involve authentication
const express = require("express");
const model = require("../business_logic.js");
let router = express.Router();

//Handler for the sign in functionality and associates userID, username and password with the current session and
//sets loggedIn to true
//Uses the authUser function from the model to check if user is valid
router.post("/signin", function (req, res) {
  if (
    model.authUser(req.body.username, req.body.password) &&
    req.session.loggedIn != true
  ) {
    req.session.username = req.body.username;
    req.session.password = req.body.password;
    req.session.loggedIn = true;
    let userObj = model.getUserByName(req.body.username);
    if (userObj != null) {
      //Sets session ID to the userID
      req.session.userID = userObj.userID;
    }
    //Everytime user logs in, the system generates a new set of recommended movies
    userObj.recommendedMovies = model.recommendMovies(userObj.userID);
    console.log("Logged in!");
    //Redirects user to profile page when they successfully log in
    res.redirect("/profile.html");
  } else {
    //if login details are not valid
    res.status(401).send("Invalid login details");
  }
});

//handles creation of new users, if successful redirects to profile page, sets the details for the session too
router.post("/signup", function (req, res) {
  if (
    model.signUp(
      req.body.username,
      req.body.password,
      req.body.g1,
      req.body.g2,
      req.body.g3
    ) &&
    req.session.loggedIn != true
  ) {
    req.session.username = req.body.username;
    req.session.password = req.body.password;
    req.session.loggedIn = true;
    req.session.userID = model.getUserByName(req.body.username).userID;
    res.redirect("/profile.html");
  } else {
    res.status(401).send("Sign-up failed. Try a different username.");
  }
});

//Handler for logging out a user from the website, assigns false to loggedIn, then destroys the session, then redirects
//user to the home page
router.get("/logout", function (req, res) {
  if (req.session.loggedIn === true) {
    req.session.loggedIn = false;
    req.session.destroy();
    res.redirect("/home.html");
  } else {
    res.redirect("/home.html");
  }
});

module.exports = router;
