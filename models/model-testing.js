const mongoose = require("mongoose");

const User = require("./user-model.js");
const Movie = require("./movie-model.js");
const Person = require("./person-model.js");
const Review = require("./review-model.js");
const ID = require("./id-model.js");

mongoose
  .connect("mongodb://localhost/movieDB", { useNewUrlParser: true })
  .then(() => {
    /*
    ID.incrementNextUserID().then((result) => {
      console.log(result);
    });
    ID.incrementNextMovieID().then((result) => {
      console.log(result);
    });
    ID.incrementNextReviewID().then((result) => {
      console.log(result);
    });
    ID.incrementNextPersonID().then((result) => {
      console.log(result);
    });*/
    /*async function signUp() {
      const nextID = await ID.getID();
      let userObj = {
        userID: nextID.nextUserID, //unique user ID, uses the global ID to determine which to use
        username: "anderson silva", //unique username
        password: "abc123",
        isContributing: false, //Regular user by default
        followers: [], //array of follower's user ID's
        followingUsers: [], //array of users ID's the user is following
        followingPeople: [], //array of person ID's of the people they're following
        reviews: [], //array of the ID's of the reviews the user has made
        favouriteGenres: ["Action", "Romance", "Drama"],
        recommendedMovies: ["Spider-Man", "Toy Story"], //array of the titles of recommended movies for the user
        notifications: [], //array of users notifications
      };
      return await User.signUp(userObj);
    }
    signUp()
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });*/
    /*async function auth() {
      const isAuth = await User.authenticate("jakubsilver", "abc123");
      if (isAuth) {
        console.log("Authorized");
        return true;
      } else {
        console.log("YOU SHALL NOT PAAAASSS");
        return false;
      }
    }
    auth().then((result) => {
      console.log(result);
    });*/
    /*User.changeUserType(0).then((result) => {
      console.log(result);
    });*/
    /*User.followUser(0, 1).then((bool) => {
      console.log(bool);
    });*/
    /*User.unfollowUser(0, 1).then((bool) => {
      console.log(bool);
    });*/
    /*User.searchUsers("and").then((result) => {
      console.log(result);
    });*/
    /*User.getUsersFollowers(1).then((array) => {
      console.log(array);
    });*/
    /*User.getUsersFollowingUsersList(0).then((array) => {
      console.log(array);
    });*/
    /*Review.addBasicReview(0, 1, 8)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });*/
    /*Review.addFullReview(
      1,
      5,
      7.5,
      "It's pretty good!",
      "I don't wanna write this long ass review but here I am"
    )
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });*/
    /*User.getUsersReviews(1)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });*/
    /*User.getUserByNameCaseIns("ANDERSON SILVA")
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });*/
    /*Person.addPerson(90, "Saint Dumas", "Actor")
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });*/
  })
  .catch((err) => {
    console.log(err);
  });
