const mongoose = require("mongoose");
const ID = require("./id-model.js");
const Schema = mongoose.Schema;

let personSchema = new Schema({
  peopleID: {
    type: Number,
  },
  name: {
    type: String,
  },
  roles: {
    type: [String],
  },
  movies: {
    type: [Number],
  },
  collaborators: {
    type: [String],
  },
});

//Queries for the model, plan is to have the business logic function just be wrappers over mongoose queries

personSchema.query.byID = function (peopleID) {
  return this.where("peopleID").equals(peopleID);
};

personSchema.query.byName = function (name) {
  return this.where("name").equals(name);
};

personSchema.statics.getPersonNameCaseIns = async function (name) {
  const person = await this.findOne({
    name: new RegExp(`^${name}$`, "i"),
  }).then((result) => {
    return result;
  });
  return person;
};

personSchema.statics.addPerson = async function (userID, personName, role) {
  const user = await User.findOne().byID(userID).exec();
  const person = await this.findOne({
    name: new RegExp(`^${personName}$`, "i"),
  })
    .then((result) => {
      return result;
    })
    .catch((err) => {
      return err;
    });

  if (!person) {
    if (user && user.isContributing) {
      const id = await ID.getID();
      let personObj = {
        peopleID: id.nextPersonID,
        name: personName,
        roles: [role],
        movies: [],
        collaborators: [],
      };
      await this.create(personObj);
      return await ID.incrementNextPersonID();
    }
  }
  return false;
};

personSchema.statics.followPerson = async function (userID, toFollowPersonID) {
  const user = await User.findOne().byID(userID).exec();
  const toFollowPerson = await this.findOne().byID(toFollowPersonID).exec();

  if (user && toFollowPerson) {
    if (!user.followingPeople.includes(toFollowPersonID)) {
      user.followingPeople.push(toFollowPersonID);
      await user.save();
      return true;
    }
  }
  return false;
};

personSchema.statics.unfollowPerson = async function (
  userID,
  toUnfollowPersonID
) {
  const user = await User.findOne().byID(userID).exec();
  const person = await this.findOne().byID(toUnfollowPersonID).exec();

  if (user && person) {
    if (user.followingPeople.includes(toUnfollowPersonID)) {
      user.followingPeople = user.followingPeople.filter(
        (elem) => elem !== toUnfollowPersonID
      );
      await user.save();
      return true;
    }
  }
  return false;
};

personSchema.statics.searchPeople = async function (searchParameter) {
  return await this.find({
    name: { $regex: searchParameter, $options: "i" },
  })
    .limit(10)
    .exec();
};

personSchema.statics.getPersonsMovies = async function (personID) {
  const person = await this.findOne().byID(personID).exec();
  let listByName = [];
  if (person) {
    let listByID = person.movies;
    for (let i = 0; i < listByID.length; ++i) {
      listByName.push((await Movie.findOne().byID(listByID[i]).exec()).title);
    }
  }
  return listByName;
};

module.exports = mongoose.model("Person", personSchema);

const User = require("./user-model.js");
const Movie = require("./movie-model.js");
