const express = require("express");
const app = express();

//Requires the business logic module that was exported
const model = require("./business_logic.js");
//Port Variable
let port = process.env.PORT || 3000;
//Calls the function which inititalizes the server with movie data
model.initServer(model.movieData);
//Runs another initialization script to create some users
model.initializationScript();

//Uses some middleware to serve static files, parse JSON data and form data
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Imports the sessions module and injects it as middleware
const session = require("express-session");
app.use(
  session({
    secret: "Please don't tamper with my session.",
    resave: false,
    saveUninitialized: false,
  })
);

//Sets the template engine to pug and serves them from the views folder
app.set("view engine", "pug");
app.set("views", "views");

//Inserts router for the public JSON api
let apiRouter = require("./routers/publicAPI-router");
app.use("/api", apiRouter);

//Inserts router for authentication
let authRouter = require("./routers/auth-router");
app.use("/auth", authRouter);

//Handler that is used for all requests except for the signin and signup
//It prevents the user from accessing any page other than login page, signup page or home page if user is not logged in
//Redirects users to sign in page
app.use(function (req, res, next) {
  if (
    req.session.loggedIn == true ||
    req.url === "/signin.html" ||
    req.url === "/signup.html" ||
    req.url === "/home.html" ||
    req.url === "/"
  ) {
    next();
  } else {
    res.redirect("/signin.html");
  }
});

//Inserts router for user actions and related pages
let userRouter = require("./routers/user-router");
app.use("/user", userRouter);

//Inserts router for people actions and related pages
let peopleRouter = require("./routers/people-router");
app.use("/people", peopleRouter);

//Inserts router for movie actions and related pages
let movieRouter = require("./routers/movie-router");
app.use("/movie", movieRouter);

//Handler for GET requests for the home page
app.get("/", function (req, res) {
  //These loggedIn and url variables are important for the navbar of the pug pages, as it shows different things
  //depending on whether user is logged in or not and what page the user is in, it shows different things
  let loggedIn = req.session.loggedIn;
  let url = req.url;
  res.render("home", { url, loggedIn });
});

//GET request handler for the home page
app.get("/home.html", function (req, res) {
  //loggedIn variable is used by the pug page to display either SIGN-IN or LOGOUT based on whether they're logged in
  let loggedIn = req.session.loggedIn;
  let url = req.url;
  res.render("home", { url, loggedIn });
});

//GET request handler for the sign in page
app.get("/signin.html", function (req, res) {
  //loggedIn variable is used by the pug page to display either SIGN-IN or LOGOUT based on whether they're logged in
  let loggedIn = req.session.loggedIn;
  if (!loggedIn) {
    let url = req.url;
    res.render("signin", { url, loggedIn });
  } else {
    res.redirect("/home.html");
  }
});

//GET request handler for the signup page
app.get("/signup.html", function (req, res) {
  //loggedIn variable is used by the pug page to display either SIGN-IN or LOGOUT based on whether they're logged in
  let loggedIn = req.session.loggedIn;
  if (!loggedIn) {
    let url = req.url;
    res.render("signup", { url, loggedIn });
  } else {
    res.redirect("/home.html");
  }
});

//GET request handler for the addmovie page
app.get("/addmovie.html", function (req, res) {
  let loggedIn = req.session.loggedIn;
  let url = req.url;
  //User can only access this page if they're contributors, sends a 401 response otherwise
  if (model.getUserByID(req.session.userID).isContributing) {
    res.render("addmovie", { url, loggedIn });
  } else {
    res
      .status(401)
      .send(
        "You are not a contributing user. Change account type to add to database"
      );
  }
});

//POST request handler for adding a basic review on the movie page
app.post("/addBasicReview/:movieID", function (req, res) {
  let movieID = parseInt(req.params.movieID);
  let title = model.getMovieByID(movieID).title;
  if (
    model.addBasicReview(
      req.session.userID,
      movieID,
      parseInt(req.body.ratingSelect)
    )
  ) {
    res.redirect("/movie/" + title);
  } else {
    res.status(400).send("Adding Review Failed");
  }
});

//POST request handler for adding a full review on the movie page
//Review data sent through an HTML form
app.post("/addFullReview/:movieID", function (req, res) {
  let movieID = parseInt(req.params.movieID);
  let title = model.getMovieByID(movieID).title;
  if (
    model.addFullReview(
      req.session.userID,
      movieID,
      parseInt(req.body.ratingSelect),
      req.body.reviewSummary,
      req.body.fullReview
    )
  ) {
    res.redirect("/movie/" + title);
  } else {
    res.status(400).send("Adding Review Failed");
  }
});

//Route handler for adding a writer to a movie when the user is a contributor, movieID is used as a parameter in the route
//to pass into the addWriter function from the model, the movieID is obtained from when the movie ID is passed into
//the pug render function when rendering the movie page
app.post("/addWriter/:movieID", function (req, res) {
  let param = parseInt(req.params.movieID);
  if (model.addWriter(req.session.userID, param, req.body.editWriter)) {
    let title = model.getMovieByID(param).title;
    res.redirect("/movie/" + title);
  } else {
    //Doesn't allow the user to add if the person doesn't exist in the database already or they're already in the movie
    res
      .status(400)
      .send(
        "The writer doesn't exist in the database or they're already in the movie."
      );
  }
});

//Route handler for adding an actor to a movie when the user is a contributor, movieID is used as a parameter in the route
//to pass into the addActor function from the model, the movieID is obtained from when the movie ID is passed into
//the pug render function when rendering the movie page
app.post("/addActor/:movieID", function (req, res) {
  let param = parseInt(req.params.movieID);
  if (model.addActor(req.session.userID, param, req.body.editActor)) {
    let title = model.getMovieByID(param).title;
    res.redirect("/movie/" + title);
  } else {
    //Doesn't allow the user to add if the person doesn't exist in the database already or they're already in the movie
    res
      .status(400)
      .send(
        "The actor doesn't exist in the database or they're already in the movie."
      );
  }
});

app.listen(port);
console.log("Server listening at http://localhost:3000");
