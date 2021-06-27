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

idSchema.statics.getID = async function () {
  return await this.findOne()
    .where("name")
    .equals("ID")
    .exec()
    .then((results) => {
      return results;
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
};

idSchema.statics.incrementNextUserID = async function () {
  return await this.getID()
    .then((results) => {
      results.nextUserID++;
      async function save() {
        return await results
          .save()
          .then((updated) => {
            console.log("USER: " + updated.nextUserID);
            return true;
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      }
      return save();
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};

idSchema.statics.incrementNextMovieID = async function () {
  return await this.getID()
    .then((results) => {
      results.nextMovieID++;
      async function save() {
        return await results
          .save()
          .then((updated) => {
            console.log("MOVIE: " + updated.nextMovieID);
            return true;
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      }
      return save();
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};

idSchema.statics.incrementNextReviewID = async function () {
  return await this.getID()
    .then((results) => {
      results.nextReviewID++;
      async function save() {
        return await results
          .save()
          .then((updated) => {
            console.log("REVIEW: " + updated.nextReviewID);
            return true;
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      }
      return save();
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};

idSchema.statics.incrementNextPersonID = async function () {
  return await this.getID()
    .then((results) => {
      results.nextPersonID++;
      async function save() {
        return await results
          .save()
          .then((updated) => {
            console.log("PERSON: " + updated.nextPersonID);
            return true;
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      }
      return save();
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};

module.exports = mongoose.model("ID", idSchema);
