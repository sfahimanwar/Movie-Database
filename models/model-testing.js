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
        username: "jakubsilver", //unique username
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
    async function auth() {
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
    });
  })
  .catch((err) => {
    console.log(err);
  });
