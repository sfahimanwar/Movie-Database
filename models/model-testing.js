const mongoose = require("mongoose");

const User = require("./user-model.js");
const Movie = require("./movie-model.js");
const Person = require("./person-model.js");
const Review = require("./review-model.js");
const ID = require("./id-model.js");

mongoose
  .connect("mongodb://localhost/movieDB", { useNewUrlParser: true })
  .then(() => {
    let id = ID.getNextUserID(function (err, results) {
      if (err) throw err;
      id = results.nextUserID;
      console.log(results.nextUserID);
      return results.nextUserID;
    });
    console.log(id);
    /*
    Movie.findOne({ genre: "Action" })
      //.byGenre("Action")
      .byID(9)
      .lean()
      .exec()
      .then((doc) => {
        if (doc) {
          console.log(doc._id);
        } else {
          console.log("N/A");
        }
      })
      .catch((err) => console.log(err)); */

    /*Movie.findOne()
      .byID(15)
      .lean()
      .exec()
      .then((doc) => {
        if (doc) {
          console.log(doc.genre);
        } else {
          console.log("Doesn't exist");
        }
      })
      .catch((err) => console.log(err)); */
    /*
    Movie.find()
      .where("movieID")
      .equals(0)
      .lean()
      .exec()
      .then((doc) => {
        console.log(doc);
      })
      .catch((err) => {
        console.log(err);
      });*/
  })
  .catch((err) => {
    console.log(err);
  });
