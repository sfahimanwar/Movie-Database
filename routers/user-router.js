//Handles routes that involve users
const express = require("express");
const model = require("../business_logic.js");
let router = express.Router();

//GET request handler for the profile page
router.get("/profile.html", function (req, res) {
  let loggedIn = req.session.loggedIn;
  let url = req.url;
  //Uses business logic function to get the user using the current session userID
  let reference = model.getUserByID(req.session.userID);
  //Creates a new object with the required information
  let user = {
    userID: reference.userID,
    username: reference.username,
    isContributing: reference.isContributing,
    followers: model.getUsersFollowers(reference.userID),
    followingUsers: model.getUsersFollowingUsersList(reference.userID),
    followingPeople: model.getUsersFollowingPeopleList(reference.userID),
    recommendedMovies: reference.recommendedMovies,
    notifications: reference.notifications,
  };
  res.render("profile", { url, loggedIn, user });
});

//PUT handler for the user changing to contributing user from regular and vice versa, the request is sent
//by client-side AJAX requests
router.put("/changeUserType", function (req, res) {
  model.changeUserType(req.session.userID);
  //Sends back different responses based on whether user is currently contributing or regular
  if (model.getUserByID(req.session.userID).isContributing) {
    res.status(200).send("User Type: Contributing");
  } else {
    res.status(200).send("User Type: Regular");
  }
});

//Route handler for when user clicks the Clear Notifications button in their profile.
//Sets the users notifications array in the user object to an empty array, redirects to same page
router.post("/clearNotifications", function (req, res) {
  model.users[req.session.userID].notifications = [];
  res.redirect("/user/profile.html");
});

//Handler for following a specific user
router.post("/followUser/:userID", function (req, res) {
  let param = parseInt(req.params.userID);
  if (model.followUser(req.session.userID, param)) {
    res.redirect("/user/" + model.getUserByID(param).username);
  } else {
    res.status(400).send("Failed to follow");
  }
});

//Handler for unfollowing a specific user
router.post("/unfollowUser/:userID", function (req, res) {
  let param = parseInt(req.params.userID);
  if (model.unfollowUser(req.session.userID, param)) {
    res.redirect("/user/" + model.getUserByID(param).username);
  } else {
    res.status(400).send("Failed to unfollow");
  }
});

//GET request handler for a specific user, if user clicks on a user link of themselves, redirects to profile page
router.get("/:user", function (req, res) {
  let loggedIn = req.session.loggedIn;
  let url = req.url;
  let userParam = req.params.user;
  //If link clicked on is the users itself
  if (userParam === req.session.username) {
    res.redirect("/user/profile.html");
  } else {
    let userObj = model.getUserByName(userParam);
    let isFollowing = false;
    //If user doesn't exist
    if (userObj === undefined) {
      res.status(404).send("User doesn't exist");
    } else {
      //Used to check if the user follows the user profile they're trying to visit
      //will use it to set the follow/unfollow button using pug accordingly
      if (
        model
          .getUserByID(req.session.userID)
          .followingUsers.includes(userObj.userID)
      ) {
        isFollowing = true;
      }
      //Creates a copy of the object so as not to overwrite everything
      let objCopy = Object.assign({}, userObj);
      objCopy.isFollowing = isFollowing;
      //Gets the people the user has followed (Director/Actor/Writer)
      objCopy.followingPeople = model.getUsersFollowingPeopleList(
        objCopy.userID
      );
      //Gets the reviews the user has made
      objCopy.reviews = model.getUsersReviews(objCopy.userID);
      for (let i = 0; i < objCopy.reviews.length; i++) {
        objCopy.reviews[i].movieName = model.getMovieByID(
          objCopy.reviews[i].movieID
        ).title;
      }
      //Ensures the actual password is not sent when rendering the page
      objCopy.password = "ENCRYPTED";
      res.render("user", { url, loggedIn, objCopy });
    }
  }
});

module.exports = router;
