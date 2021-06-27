const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let movieSchema = new Schema({
  movieID: {
    type: Number,
    unique: true,
  },
  title: {
    type: String,
    minlength: 1,
  },
  yearReleased: {
    type: Number,
  },
  runtime: {
    type: String,
  },
  plot: {
    type: String,
  },
  genre: {
    type: [String],
  },
  actors: {
    type: [String],
  },
  director: {
    type: String,
  },
  writers: {
    type: [String],
  },
  reviews: {
    type: [Number],
  },
  noOfRatings: {
    type: Number,
  },
  totalRating: {
    type: Number,
  },
  averageRating: {
    type: Number,
  },
  similarMovies: {
    type: [String],
  },
});

//Queries for the model, plan is to have the business logic function just be wrappers over mongoose queries

movieSchema.query.byID = function (movieID) {
  return this.where("movieID").equals(movieID);
};

movieSchema.query.byTitle = function (title) {
  return this.where("title").equals(title);
};

movieSchema.query.byYear = function (year) {
  return this.where("yearReleased").equals(year);
};

movieSchema.query.byMinRating = function (minRating) {
  return this.where("averageRating").gte(minRating);
};

module.exports = mongoose.model("Movie", movieSchema);
