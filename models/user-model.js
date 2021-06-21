const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema({
  userID: {
    type: Number,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 1,
  },
  isContributing: {
    type: Boolean,
    default: false,
  },
  followers: {
    type: [Number],
  },
  followingUsers: {
    type: [Number],
  },
  followingPeople: {
    type: [Number],
  },
  reviews: {
    type: [Number],
  },
  favouriteGenres: {
    type: [String],
    maxlength: 3,
    default: ["Action", "Romance", "Drama"],
  },
  recommendedMovies: {
    type: [String],
  },
  notifications: {
    type: [String],
  },
});

//Queries for the model, plan is to have the business logic function just be wrappers over mongoose queries

userSchema.query.byID = function (userID) {
  return this.where("userID").equals(userID);
};

userSchema.query.byUsername = function (username) {
  return this.where("username").equals(username);
};

//Static methods for the model, business logic functions will wrap around these methods
userSchema.statics.authenticate = function (username, password) {
  this.findOne()
    .byUsername(username)
    .exec()
    .then((doc) => {
      if (doc) {
        if (doc.password === password) {
          return true;
        } else {
          return false;
        }
      }
      return false;
    })
    .catch((err) => console.log(err));
};

module.exports = mongoose.model("User", userSchema);
