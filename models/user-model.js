const mongoose = require("mongoose");
const ID = require("./id-model.js");
const Person = require("./person-model.js");
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

userSchema.statics.changeUserType = async function (userID) {
  const doc = await this.findOne().byID(userID).exec();
  if (doc) {
    doc.isContributing = !doc.isContributing;
    const newDoc = await doc.save();
    return true;
  } else {
    return false;
  }
};

userSchema.statics.followUser = async function (userID, toFollowUserID) {
  const user = await this.findOne().byID(userID).exec();
  const toFollowUser = await this.findOne().byID(toFollowUserID).exec();

  if (user && toFollowUser && userID !== toFollowUserID) {
    if (!user.followingUsers.includes(toFollowUserID)) {
      user.followingUsers.push(toFollowUserID);
      toFollowUser.followers.push(userID);
      await user.save();
      await toFollowUser.save();
      return true;
    }
  }
  return false;
};

userSchema.statics.unfollowUser = async function (userID, toUnfollowUserID) {
  const user = await this.findOne().byID(userID).exec();
  const toUnfollowUser = await this.findOne().byID(toUnfollowUserID).exec();
  if (user && toUnfollowUser) {
    if (user.followingUsers.includes(toUnfollowUserID)) {
      user.followingUsers = user.followingUsers.filter(
        (elem) => elem !== toUnfollowUserID
      );
      toUnfollowUser.followers = toUnfollowUser.followers.filter(
        (elem) => elem !== userID
      );
      await user.save();
      await toUnfollowUser.save();
      return true;
    }
  }
  return false;
};

userSchema.statics.searchUsers = async function (searchParameter) {
  return await this.find({
    username: { $regex: searchParameter, $options: "i" },
  })
    .limit(10)
    .exec();
};

userSchema.statics.getUsersFollowers = async function (userID) {
  const user = await this.findOne().byID(userID).exec();
  let listByName = [];
  if (user) {
    let listByID = user.followers;
    for (let i = 0; i < listByID.length; ++i) {
      listByName.push((await this.findOne().byID(listByID[i]).exec()).username);
    }
  }
  return listByName;
};

userSchema.statics.getUsersFollowingUsersList = async function (userID) {
  const user = await this.findOne().byID(userID).exec();
  let listByName = [];
  if (user) {
    let listByID = user.followingUsers;
    for (let i = 0; i < listByID.length; ++i) {
      listByName.push((await this.findOne().byID(listByID[i]).exec()).username);
    }
  }
  return listByName;
};

userSchema.statics.getUsersFollowingPeopleList = async function (userID) {
  const user = await this.findOne().byID(userID).exec();
  let listByName = [];
  if (user) {
    let listByID = user.followingPeople;
    for (let i = 0; i < listByID.length; ++i) {
      listByName.push((await Person.findOne().byID(listByID[i]).exec()).name);
    }
  }
  return listByName;
};

userSchema.statics.getUsersReviews = async function (userID) {
  const user = await this.findOne().byID(userID).exec();
  let fullList = [];
  if (user) {
    let listByID = user.reviews;
    for (let i = 0; i < listByID.length; ++i) {
      fullList.push(await Review.findOne().byID(listByID[i]).exec());
    }
  }
  return fullList;
};

module.exports = mongoose.model("User", userSchema);

const Review = require("./review-model.js");
