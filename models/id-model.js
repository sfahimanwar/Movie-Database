const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let idSchema = new Schema({
  name: {
    type: String,
  },
  nextUserID: {
    type: Number,
    min: 0,
  },
  nextMovieID: {
    type: Number,
    min: 0,
  },
  nextReviewID: {
    type: Number,
    min: 0,
  },
  nextPersonID: {
    type: Number,
    min: 0,
  },
});

idSchema.statics.getNextUserID = function (callback) {
  this.findOne().where("name").equals("ID").lean().exec(callback);
};

idSchema.statics.getNextMovieID = function () {
  this.findOne()
    .where("name")
    .equals("ID")
    .lean()
    .exec()
    .then((doc) => {
      return doc.nextMovieID;
    })
    .catch((err) => {
      console.log(err);
      return 0;
    });
};

idSchema.statics.getNextPersonID = function () {
  this.findOne()
    .where("name")
    .equals("ID")
    .lean()
    .exec()
    .then((doc) => {
      return doc.nextPersonID;
    })
    .catch((err) => {
      console.log(err);
      return 0;
    });
};

idSchema.statics.getNextReviewID = function () {
  this.findOne()
    .where("name")
    .equals("ID")
    .lean()
    .exec()
    .then((doc) => {
      return doc.nextReviewID;
    })
    .catch((err) => {
      console.log(err);
      return 0;
    });
};

idSchema.statics.incrementNextUserID = function () {};

module.exports = mongoose.model("ID", idSchema);
