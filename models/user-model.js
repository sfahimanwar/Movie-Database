const mongoose = require("mongoose");
const ID = require("./id-model.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;
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
userSchema.statics.authenticate = async function (username, password) {
  const doc = await this.findOne().byUsername(username).exec();
  let isMatch = false;
  if (doc) {
    isMatch = await bcrypt.compare(password, doc.password);
  }
  return doc && isMatch;
};

userSchema.statics.signUp = async function (userObj) {
  let username = userObj.username;
  let password = userObj.password;
  userObj.password = await bcrypt.hash(password, saltRounds);
  const doc = await this.findOne({
    username: new RegExp(`^${username}$`, "i"),
  }).then((result) => {
    return result;
  });

  if (doc) {
    return false;
  } else {
    async function inc() {
      return await ID.incrementNextUserID();
    }
    const newUser = await this.create(userObj);
    console.log(newUser);
    return await inc();
  }
};

module.exports = mongoose.model("User", userSchema);
