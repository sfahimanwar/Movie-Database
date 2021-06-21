const mongoose = require("mongoose");
const movieData = require("./movie-data-short.json");

const User = require("./models/user-model.js");
const Movie = require("./models/movie-model.js");
const Review = require("./models/review-model.js");
const Person = require("./models/person-model.js");
const ID = require("./models/id-model.js");

//4 Arrays storing the different objects of the application - Users, Movies, People (Actors, Directors, Writers), and the Reviews
let users = [];
let movies = [];
let people = [];
let reviews = [];

//Global variables storing the next ID to be used, is incremented when any of the objects are added respectively
let nextUserID = 0;
let nextMovieID = 0;
let nextReviewID = 0;
let nextPeopleID = 0;

//helper function passed as a callback function for the filter function to ensure everything in array is unique
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

//This function initializes all the movie data (Both people and movies) into a usable format and stores them in their respective arrays
//takes an argument to specify the JSON data to be used
function initServer(data) {
  //Iterates through the objects in the JSON file
  for (movie in data) {
    //splits the actors for the movie in the JSON data and store them individually in an array
    let array1 = data[movie].Actors.split(", ");
    //Uses regex and filter to transform the writers data from the JSON file to a usable format
    let array2 = data[movie].Writer.replace(/ *\([^)]*\) */g, "")
      .split(", ")
      .filter(onlyUnique);
    let array3 = data[movie].Director.split(", ");

    //Adds all the people involved in the movie into a single array and makes sure its unique
    let peopleArray = array1.concat(array2, array3).filter(onlyUnique);

    for (let i = 0; i < peopleArray.length; i++) {
      if (!people.some((elem) => elem.name === peopleArray[i])) {
        let roles = [];
        if (data[movie].Actors.includes(peopleArray[i])) {
          roles.push("Actor");
        }
        if (data[movie].Writer.includes(peopleArray[i])) {
          roles.push("Writer");
        }
        if (data[movie].Director.includes(peopleArray[i])) {
          roles.push("Director");
        }
        //Creates a person object for each person involved in the movie and adds it to the people array
        let peopleObj = {
          peopleID: nextPeopleID, //global person id
          name: peopleArray[i],
          roles: roles, //what roles the person has played in various movies
          movies: [nextMovieID], // array of the ID's of the movies the person has been involved in
          collaborators: peopleArray.filter((elem) => elem != peopleArray[i]),
        };
        people.push(peopleObj);
        nextPeopleID++;
      } else {
        //This else block is executed when the person already exists in the people array and just adds the info to the existing record
        let foundPersonIndex = people.findIndex(
          (elem) => elem.name === peopleArray[i]
        );
        people[foundPersonIndex].movies.push(nextMovieID);
        let tempArray = peopleArray.filter((elem) => elem != peopleArray[i]);
        for (let i = 0; i < tempArray.length; i++) {
          people[foundPersonIndex].collaborators.push(tempArray[i]);
        }
        //Ensures the collaborators are unique, uses the onlyUnique function passed in as an argument
        people[foundPersonIndex].collaborators =
          people[foundPersonIndex].collaborators.filter(onlyUnique);
      }
    }
    //Creates a movie object for the movie and then adds it to the movies array
    let movieObj = {
      movieID: nextMovieID, //global movie ID
      title: data[movie].Title, //extracted from the JSON data
      yearReleased: data[movie].Year, //extracted from the JSON data
      runtime: data[movie].Runtime, //extracted from the JSON data
      plot: data[movie].Plot, //extracted from the JSON data
      genre: data[movie].Genre.split(", "), //extracted from the JSON data
      actors: array1, //extracted from the JSON data
      director: data[movie].Director, //extracted from the JSON data
      writers: array2, //extracted from the JSON data after some processing
      reviews: [], //array of the ID's of the reviews made for this movie
      noOfRatings: 0, //total number of ratings made for the movie
      totalRating: 0, //cumulative total of the ratings
      averageRating: 0, //uses above two values to calculate average rating
      similarMovies: [], //List of similar movies to this one, populated at the end of this function
    };
    movies.push(movieObj);
    nextMovieID++;
  }
  //Creates similar movies for every movie iin the array, each movie has max 10 similar movies
  //Iterates through the whole array for each movie in the array( not efficient ik, but this ain't 2402 ¯\_(ツ)_/¯ )
  //Adds movies containing, the same director, or writers, or actors, and if none, uses similar genres
  for (let i = 0; i < movies.length; i++) {
    for (let j = 0; j < movies.length; j++) {
      //Ensures it isn't adding the same movie
      if (i != j) {
        //If length is greater than 10, it breaks
        if (movies[i].similarMovies.length > 10) {
          break;
        }
        //If it has same director, adds the movie
        if (movies[i].director === movies[j].director) {
          movies[i].similarMovies.push(movies[j].title);
          if (movies[i].similarMovies.length > 10) {
            break;
          }
        }
        //If it has a mutual actor, adds the movie
        for (let l = 0; l < movies[i].actors.length; l++) {
          if (movies[j].actors.includes(movies[i].actors[l])) {
            movies[i].similarMovies.push(movies[j].title);
            break;
          }
        }
        if (movies[i].similarMovies.length > 10) {
          break;
        }
        //If it has mutual writers, adds the movie
        for (let m = 0; m < movies[i].writers.length; m++) {
          if (movies[j].writers.includes(movies[i].writers[m])) {
            movies[i].similarMovies.push(movies[j].title);
            break;
          }
        }
        if (movies[i].similarMovies.length > 10) {
          break;
        }
      }
    }
    //Ensures the entries are unique
    movies[i].similarMovies = movies[i].similarMovies.filter(onlyUnique);
  }
  //If the similar movies was less than 10, genres are used to add similar movies
  for (let i = 0; i < movies.length; i++) {
    if (movies[i].similarMovies.length > 10) {
      continue;
    }
    for (let j = 0; j < movies.length; j++) {
      if (i != j) {
        for (let k = 0; k < movies[i].genre.length; k++) {
          if (movies[j].genre.includes(movies[i].genre[k])) {
            movies[i].similarMovies.push(movies[j].title);
            break;
          }
        }
        if (movies[i].similarMovies.length > 10) {
          break;
        }
      }
    }
    movies[i].similarMovies = movies[i].similarMovies.filter(onlyUnique);
  }
}

initServer(movieData);

let db;

mongoose
  .connect("mongodb://localhost/movieDB", { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to DB successfully");
  })
  .catch((err) => {
    console.log("Connection error: " + err);
  });

db = mongoose.connection;

db.on("error", console.error.bind(console, "Console error: "));
db.on("open", () => {
  mongoose.connection.db
    .dropDatabase()
    .then(() => {
      console.log("Database dropped, reinitializing it.");
      Movie.insertMany(movies)
        .then(() => {
          console.log("Movies Added");
        })
        .catch((err) => {
          console.log("Error adding movies:" + err);
        });

      Person.insertMany(people)
        .then(() => {
          console.log("People added to the database successfully");
        })
        .catch((err) => {
          console.log("Error adding people: " + err);
        });

      let idObject = {
        name: "ID",
        nextUserID: nextUserID,
        nextMovieID: nextMovieID,
        nextReviewID: nextReviewID,
        nextPersonID: nextPeopleID,
      };
      ID.create(idObject)
        .then(() => {
          console.log("ID's added");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log("Error dropping database: " + err);
    });
});
