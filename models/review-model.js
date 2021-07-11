const mongoose = require("mongoose");
const Movie = require("./movie-model.js");
const ID = require("./id-model.js");
const Schema = mongoose.Schema;

let reviewSchema = new Schema({
  reviewID: {
    type: Number,
  },
  userID: {
    type: Number,
  },
  username: {
    type: String,
  },
  movieID: {
    type: Number,
  },
  summary: {
    type: String,
  },
  rating: {
    type: Number,
  },
  fullReview: {
    type: String,
  },
});

//Queries for the model, plan is to have the business logic function just be wrappers over mongoose queries

reviewSchema.query.byID = function (reviewID) {
  return this.where("reviewID").equals(reviewID);
};

reviewSchema.statics.calculateAvgRating = async function (movieID, rating) {
  const movie = await Movie.findOne().byID(movieID).exec();
  if (movie) {
    movie.noOfRatings++;
    movie.totalRating += rating;
    movie.averageRating = movie.totalRating / movie.noOfRatings;
    await movie.save();
    return true;
  }
  return false;
};

reviewSchema.statics.addBasicReview = async function (userID, movieID, rating) {
  const user = await User.findOne().byID(userID).exec();
  const movie = await Movie.findOne().byID(movieID).exec();

  if (user && movie) {
    return await this.calculateAvgRating(movieID, rating);
  }
  return false;
};

reviewSchema.statics.addFullReview = async function (
  userID,
  movieID,
  rating,
  summary,
  fullReview
) {
  const user = await User.findOne().byID(userID).exec();
  const movie = await Movie.findOne().byID(movieID).exec();
  const id = await ID.getID();

  if (user && movie) {
    let reviewObj = {
      reviewID: id.nextReviewID, //unique review ID
      userID: userID, //ID of the user that made the review
      username: user.username,
      movieID: movieID, //The movie for which the review is being made
      summary: summary, //summary of review
      rating: rating, //rating out of 10
      fullReview: fullReview,
    };

    let newReview = await this.create(reviewObj);

    movie.reviews.push(reviewObj.reviewID);
    user.reviews.push(reviewObj.reviewID);

    await movie.save();
    await user.save();

    let string = reviewObj.username + " added a review";
    for (let i = 0; i < user.followers.length; i++) {
      //users[users[userID].followers[i]].notifications.unshift(string);
      let userToBeNotified = await User.findOne()
        .byID(user.followers[i])
        .exec();
      userToBeNotified.notifications.unshift(string);
      await userToBeNotified.save();
    }
    await this.calculateAvgRating(movieID, rating);
    return await ID.incrementNextReviewID();
  }
};

module.exports = mongoose.model("Review", reviewSchema);

const User = require("./user-model.js");
