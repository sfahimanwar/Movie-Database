const mongoose = require("mongoose");
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

module.exports = mongoose.model("Review", reviewSchema);
