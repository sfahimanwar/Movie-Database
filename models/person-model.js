const mongoose = require("mongoose");
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

module.exports = mongoose.model("Person", personSchema);
