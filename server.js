const express = require('express');
const app = express();

//Requires the business logic module that was exported
const model = require('./business_logic.js');
//Port Variable
let port = process.env.PORT || 3000;
//Calls the function which inititalizes the server with movie data
model.initServer(model.movieData);
//Runs another initialization script to create some users
model.initializationScript();

//Uses some middleware to serve static files, parse JSON data and form data
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Imports the sessions module and injects it as middleware
const session = require('express-session');
app.use(session({secret:"Please don't tamper with my session.", resave: false, saveUninitialized: false}));

//Inserts the different routers to handle requests
let apiRouter = require('./routers/publicAPI-router');
app.use('/api', apiRouter);

let authRouter = require('./routers/auth-router');
app.use('/auth', authRouter);

//Sets the template engine to pug and serves them from the views folder
app.set("view engine","pug");
app.set("views","views");

//Handler that is used for all requests except for the signin and signup
//It prevents the user from accessing any page other than login page, signup page or home page if user is not logged in
//Redirects users to sign in page
app.use(function(req,res,next){
    if(req.session.loggedIn == true || req.url === '/signin.html' || req.url === '/signup.html'
        || req.url === '/home.html' || req.url === '/'){
        next();
    }else{
        res.redirect('/signin.html');
    }
});

//Handler for GET requests for the home page
app.get('/',function(req,res){
    //These loggedIn and url variables are important for the navbar of the pug pages, as it shows different things
    //depending on whether user is logged in or not and what page the user is in, it shows different things
    let loggedIn = req.session.loggedIn;
    let url = req.url;
    res.render('home',{url,loggedIn});

});

//GET request handler for the home page
app.get('/home.html',function(req,res){
    //loggedIn variable is used by the pug page to display either SIGN-IN or LOGOUT based on whether they're logged in
    let loggedIn = req.session.loggedIn;
    let url = req.url;
    res.render('home',{url,loggedIn});

});

//GET request handler for the sign in page
app.get('/signin.html',function(req,res){
    //loggedIn variable is used by the pug page to display either SIGN-IN or LOGOUT based on whether they're logged in
    let loggedIn = req.session.loggedIn;
    if(!loggedIn){
        let url = req.url;
        res.render('signin',{url,loggedIn});
    }else{
        res.redirect('/home.html');
    }
});

//GET request handler for the signup page
app.get('/signup.html',function(req,res){
    //loggedIn variable is used by the pug page to display either SIGN-IN or LOGOUT based on whether they're logged in
    let loggedIn = req.session.loggedIn;
    if(!loggedIn){
        let url = req.url;
        res.render('signup',{url,loggedIn});
    }else{
        res.redirect('/home.html');
    }
});

//GET request handler for the profile page
app.get('/profile.html',function(req,res){
   let loggedIn = req.session.loggedIn;
   let url = req.url;
   //Uses business logic function to get the user using the current session userID
   let reference = model.getUserByID(req.session.userID);
   //Creates a new object with the required information
   let user = {
       userID: reference.userID,
       username: reference.username,
       isContributing: reference.isContributing,
       followers: model.getUsersFollowers(reference.userID),
       followingUsers: model.getUsersFollowingUsersList(reference.userID),
       followingPeople: model.getUsersFollowingPeopleList(reference.userID),
       recommendedMovies: reference.recommendedMovies,
       notifications: reference.notifications
   }
   res.render('profile',{url,loggedIn,user});
});

//PUT handler for the user changing to contributing user from regular and vice versa, the request is sent
//by client-side AJAX requests
app.put('/changeUserType',function(req,res){
   model.changeUserType(req.session.userID);
   //Sends back different responses based on whether user is currently contributing or regular
   if(model.getUserByID(req.session.userID).isContributing){
       res.status(200).send('User Type: Contributing');
   }else{
       res.status(200).send('User Type: Regular');
   }
});

//GET request handler for the addmovie page
app.get('/addmovie.html',function(req,res){
    let loggedIn = req.session.loggedIn;
    let url = req.url;
    //User can only access this page if they're contributors, sends a 401 response otherwise
    if(model.getUserByID(req.session.userID).isContributing){
        res.render('addmovie',{url,loggedIn});
    }else{
        res.status(401).send("You are not a contributing user. Change account type to add to database");
    }

});

//GET request handler for a specific person's page, has a person parameter
app.get('/people/:person',function(req,res){
    let loggedIn = req.session.loggedIn;
    let url = req.url;
    let personParam = req.params.person;
    //Gets the person object using the model's function
    let personObj = model.getPersonByName(personParam);
    //Is the user following the person, used for rendering of the follow/unfollow button on the pug page
    let isFollowing = false;
    if(personObj === undefined){
        res.status(404).send("Person doesn't exist");
    }else{
        //If user follows this person isFollowing is set to true
        if(model.getUserByID(req.session.userID).followingPeople.includes(personObj.peopleID)){
            isFollowing = true;
        }
        //Creates a copy of the object so as not to overwrite the original object as references are being used
        let objCopy = Object.assign({}, personObj);
        //Creates a new isFollowing property for the object
        objCopy.isFollowing = isFollowing;
        objCopy.movies = model.getPersonsMovies(personObj.peopleID);
        //Gets only 5 of their collaborators
        objCopy.collaborators = personObj.collaborators.slice(0,5);
        res.render('people',{url,loggedIn,objCopy});
    }

});

//PUT handler for following a person by clicking the button on their profile
app.put('/followPerson',function(req,res){
    if(model.followPerson(req.session.userID,model.getPersonByName(req.body.name).peopleID) === true){
        res.status(200).send('Unfollow');
    }else{
        res.status(404).send('Failed');
    }
});

//PUT handler for unfollowing a person by clicking the button
app.put('/unfollowPerson',function(req,res){
    if(model.unfollowPerson(req.session.userID,model.getPersonByName(req.body.name).peopleID) === true){
        res.status(200).send('Follow');
    }else{
        res.status(404).send('Failed');
    }
});

//Handler for the search function, when user types into the search box and clicks the button
app.post('/search',function(req,res){
    let loggedIn = req.session.loggedIn;
    let url = req.url;
    let searchResults = (model.searchMovie(req.body.searchQuery)).map(elem => elem.title);
    let searchObj = {
        searchResults: searchResults,
        searchQuery: req.body.searchQuery,
        length: searchResults.length
    }
    res.render('search',{url,loggedIn,searchObj});
});

//GET handler for a specific movie page, uses movie name as a parameter
app.get('/movie/:movie',function(req,res){
    let loggedIn = req.session.loggedIn;
    let url = req.url;
    let user = model.getUserByID(req.session.userID);
    let userCopy = Object.assign({},user);
    let movieParam = req.params.movie;
    let movieObj = model.getMovieByName(movieParam);
    if(movieObj === undefined){
        res.status(404).send("Movie doesn't exist");
    }else{
        //Makes a copy of the movie object so as not to overwrite actual data when adding the reviews
        //Since JS uses pass by reference
        let objCopy = Object.assign({}, movieObj);
        objCopy.reviews = model.getMoviesReviews(objCopy.movieID);
        //Rounds the average rating to 1 decimal place
        objCopy.averageRating = objCopy.averageRating.toFixed(1);
        res.render('movie',{loggedIn,url,objCopy,userCopy});
    }

});

//Shows search results for a specific genre, its used when use clicks on a genre keyword on a movie page
app.get('/genreSearch/:genre',function(req,res){
    let loggedIn = req.session.loggedIn;
    let url = req.url;
    let genreParam = req.params.genre;
    let searchResults = (model.searchByGenre(genreParam)).map(elem => elem.title);
    let searchObj = {
        searchResults: searchResults,
        searchQuery: genreParam,
        length: searchResults.length
    }
    res.render('search',{url,loggedIn,searchObj});
});

//POST request handler for adding a basic review on the movie page
app.post('/addBasicReview/:movieID',function(req,res){
    let movieID = parseInt(req.params.movieID);
    let title = model.getMovieByID(movieID).title;
    if(model.addBasicReview(req.session.userID,movieID,parseInt(req.body.ratingSelect))){
        res.redirect('/movie/' + title);
    }else{
        res.status(400).send('Adding Review Failed');
    }
});

//POST request handler for adding a full review on the movie page
//Review data sent through an HTML form
app.post('/addFullReview/:movieID',function(req,res){
    let movieID = parseInt(req.params.movieID);
    let title = model.getMovieByID(movieID).title;
    if(model.addFullReview(req.session.userID,movieID,parseInt(req.body.ratingSelect),req.body.reviewSummary,req.body.fullReview)){
        res.redirect('/movie/' + title);
    }else{
        res.status(400).send('Adding Review Failed');
    }
});

//POST request handler for adding a new movie in the contributing page which user can access through the profile
//Movie data is sent through an HTML form
app.post('/addMovie',function(req,res){
   if(model.addMovie(req.session.userID,req.body.title,req.body.year,req.body.runtime,
       req.body.plot,req.body.genre1,req.body.genre2,req.body.actor1,
       req.body.actor2,req.body.actor3,req.body.director,req.body.writer)){
       //redirects to the movie page of the movie added if it was successful
       res.redirect('/movie/' + req.body.title);
   }else{
       //If adding the movie failed
       res.status(400).send("Adding movie failed. Either movie already exists or the people in the movie added are not in the database");
   }
});

//POST request handler for adding a new person in the contributing page which user can access through the profile
//Person data is sent through an HTML form
app.post('/addPerson',function(req,res){
   if(model.addPerson(req.session.userID,req.body.name,req.body.role)){
       //redirects to the page of the person added if it was successful
       res.redirect('/people/' + req.body.name);
   }else{
       //If the person already exists in the database
       res.status(400).send('Person already exists in the database');
   }
});

//GET request handler for a specific user, if user clicks on a user link of themselves, redirects to profile page
app.get('/user/:user',function(req,res){
    let loggedIn = req.session.loggedIn;
    let url = req.url;
    let userParam = req.params.user;
    //If link clicked on is the users itself
    if(userParam === req.session.username){
        res.redirect('/profile.html');
    }
    else {
        let userObj = model.getUserByName(userParam);
        let isFollowing = false;
        //If user doesn't exist
        if (userObj === undefined) {
            res.status(404).send("User doesn't exist");
        }else {
            //Used to check if the user follows the user profile they're trying to visit
            //will use it to set the follow/unfollow button using pug accordingly
            if (model.getUserByID(req.session.userID).followingUsers.includes(userObj.userID)) {
                isFollowing = true;
            }
            //Creates a copy of the object so as not to overwrite everything
            let objCopy = Object.assign({}, userObj);
            objCopy.isFollowing = isFollowing;
            //Gets the people the user has followed (Director/Actor/Writer)
            objCopy.followingPeople = model.getUsersFollowingPeopleList(objCopy.userID);
            //Gets the reviews the user has made
            objCopy.reviews = model.getUsersReviews(objCopy.userID);
            for (let i = 0; i < objCopy.reviews.length; i++) {
                objCopy.reviews[i].movieName = model.getMovieByID(objCopy.reviews[i].movieID).title;
            }
            //Ensures the actual password is not sent when rendering the page
            objCopy.password = 'ENCRYPTED';
            res.render('user', {url, loggedIn, objCopy});
        }
    }
});

//Handler for following a specific user
app.post('/followUser/:userID',function(req,res){
    let param = parseInt(req.params.userID);
    if(model.followUser(req.session.userID,param)){
        res.redirect('/user/' + model.getUserByID(param).username);
    }else{
        res.status(400).send("Failed to follow");
    }
});

//Handler for unfollowing a specific user
app.post('/unfollowUser/:userID',function(req,res){
    let param = parseInt(req.params.userID);
    if(model.unfollowUser(req.session.userID,param)){
        res.redirect('/user/' + model.getUserByID(param).username);
    }else{
        res.status(400).send("Failed to unfollow");
    }
});

//Route handler for when user clicks the Clear Notifications button in their profile.
//Sets the users notifications array in the user object to an empty array, redirects to same page
app.post('/clearNotifications',function(req,res){
    model.users[req.session.userID].notifications = [];
    res.redirect('/profile.html');
});

//Route handler for adding a writer to a movie when the user is a contributor, movieID is used as a parameter in the route
//to pass into the addWriter function from the model, the movieID is obtained from when the movie ID is passed into
//the pug render function when rendering the movie page
app.post('/addWriter/:movieID',function(req,res){
   let param = parseInt(req.params.movieID);
   if(model.addWriter(req.session.userID,param,req.body.editWriter)){
       let title = model.getMovieByID(param).title;
       res.redirect('/movie/' + title);
   }else{
       //Doesn't allow the user to add if the person doesn't exist in the database already or they're already in the movie
       res.status(400).send("The writer doesn't exist in the database or they're already in the movie.")
   }
});

//Route handler for adding an actor to a movie when the user is a contributor, movieID is used as a parameter in the route
//to pass into the addActor function from the model, the movieID is obtained from when the movie ID is passed into
//the pug render function when rendering the movie page
app.post('/addActor/:movieID',function(req,res){
    let param = parseInt(req.params.movieID);
    if(model.addActor(req.session.userID,param,req.body.editActor)){
        let title = model.getMovieByID(param).title;
        res.redirect('/movie/' + title);
    }else{
        //Doesn't allow the user to add if the person doesn't exist in the database already or they're already in the movie
        res.status(400).send("The actor doesn't exist in the database or they're already in the movie.")
    }
});



app.listen(port);
console.log("Server listening at http://localhost:3000");