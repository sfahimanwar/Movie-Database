//Business logic file, exported as a module for use by server.js.
//SOME COMMENTS MAY BE OUTDATED AS THIS FILE WAS CREATED FOR CHECK-IN 2, I UPDATED WHEREVER POSSIBLE
/*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  SOME NOTES -                                                                                                            //
//  * Initializing the movie data will take some time                                                                       //                                               //
//  * Some of the functions are helper functions in the program which I have commented and mentioned                        //
//  * There are some validations/checks I have skipped while writing some functions because my webpages/entry forms are     //
//    designed in a way which won't allow invalid entries.                                                                  //
//  * There will be multiple functions which do similar things but in different ways, this is to accommodate the REST API   //
//    and the design of my webpages, for example there is getUserByName(), getUserByID(), searchUsers(), there are similar  //
//    repeated ones for movies and people, the first two are for exact searches which might not be used directly by the user//
//    of the webpage but for communication between the server/client, the functions with search..() are for returning an    //
//    array of matching results but limited to 10 results.                                                                  //
//  * This whole system assigns unique integer ID's for each object, in a lot of cases it makes storing of data more        //
//    efficient. Example movie objects store the ID of their reviews instead of the whole review object, users store the    //
//    ID's of their followers instead of the whole user object in their followers array. This is repeated throughout the    //
//    design of the system.                                                                                                 //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

// These variable is storing the imported json movie data given to us for the project
let movieData = require('./movie-data.json');

//4 Arrays storing the different objects of the application - Users, Movies, People (Actors, Directors, Writers), and the Reviews
let users =[];
let movies=[];
let people =[];
let reviews=[];

//Global variables storing the next ID to be used, is incremented when any of the objects are added respectively
let nextUserID = 0;
let nextMovieID = 0;
let nextReviewID = 0;
let nextPeopleID = 0;

//helper function passed as a callback function for the filter function to ensure everything in array is unique
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

//A helper method for shuffling arrays using the Fisher-Yates algorithm
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

//This function initializes all the movie data (Both people and movies) into a usable format and stores them in their respective arrays
//takes an argument to specify the JSON data to be used
function initServer(data){
    //Iterates through the objects in the JSON file
    for(movie in data){
        //splits the actors for the movie in the JSON data and store them individually in an array
        let array1 = data[movie].Actors.split(', ');
        //Uses regex and filter to transform the writers data from the JSON file to a usable format
        let array2 = data[movie].Writer.replace(/ *\([^)]*\) */g, "").split(', ').filter(onlyUnique);
        let array3 = data[movie].Director.split(', ');

        //Adds all the people involved in the movie into a single array and makes sure its unique
        let peopleArray = array1.concat(array2,array3).filter(onlyUnique);

        for(let i =0; i<peopleArray.length; i++){
            if(!people.some(elem => elem.name === peopleArray[i])){
                let roles =[];
                if(data[movie].Actors.includes(peopleArray[i])){
                    roles.push('Actor');
                }
                if(data[movie].Writer.includes(peopleArray[i])){
                    roles.push('Writer');
                }
                if(data[movie].Director.includes(peopleArray[i])){
                    roles.push('Director');
                }
                //Creates a person object for each person involved in the movie and adds it to the people array
                let peopleObj = {
                    peopleID: nextPeopleID, //global person id
                    name: peopleArray[i],
                    roles: roles, //what roles the person has played in various movies
                    movies: [nextMovieID], // array of the ID's of the movies the person has been involved in
                    collaborators: peopleArray.filter(elem => elem != peopleArray[i]),
                }
                people.push(peopleObj);
                nextPeopleID++;
            }else{
                //This else block is executed when the person already exists in the people array and just adds the info to the existing record
                let foundPersonIndex = people.findIndex(elem => elem.name === peopleArray[i]);
                people[foundPersonIndex].movies.push(nextMovieID);
                let tempArray = peopleArray.filter(elem => elem != peopleArray[i]);
                for(let i =0; i<tempArray.length; i++) {
                    people[foundPersonIndex].collaborators.push(tempArray[i]);
                }
                //Ensures the collaborators are unique, uses the onlyUnique function passed in as an argument
                people[foundPersonIndex].collaborators = people[foundPersonIndex].collaborators.filter(onlyUnique);
            }
        }
        //Creates a movie object for the movie and then adds it to the movies array
        let movieObj ={
            movieID: nextMovieID, //global movie ID
            title: data[movie].Title, //extracted from the JSON data
            yearReleased: data[movie].Year, //extracted from the JSON data
            runtime: data[movie].Runtime, //extracted from the JSON data
            plot: data[movie].Plot, //extracted from the JSON data
            genre: data[movie].Genre.split(', '), //extracted from the JSON data
            actors: array1, //extracted from the JSON data
            director: data[movie].Director, //extracted from the JSON data
            writers: array2, //extracted from the JSON data after some processing
            reviews: [], //array of the ID's of the reviews made for this movie
            noOfRatings: 0, //total number of ratings made for the movie
            totalRating: 0, //cumulative total of the ratings
            averageRating: 0, //uses above two values to calculate average rating
            similarMovies: [] //List of similar movies to this one, populated at the end of this function
        }
        movies.push(movieObj);
        nextMovieID++;
    }
    //Creates similar movies for every movie iin the array, each movie has max 10 similar movies
    //Iterates through the whole array for each movie in the array( not efficient ik, but this ain't 2402 ¯\_(ツ)_/¯ )
    //Adds movies containing, the same director, or writers, or actors, and if none, uses similar genres
    for(let i =0; i<movies.length;i++){
        for(let j=0; j<movies.length;j++){
            //Ensures it isn't adding the same movie
            if(i != j) {
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
    for(let i =0; i<movies.length;i++) {
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

//error helper function to print error to console if something is unsuccessful
function error(){
    console.log('ERROR');
}

/*//////////////////////////////////////////////USER FUNCTIONS///////////////////////////////////*/

//function used to authorize user when trying to log in
function authUser(username, password){
    if(users.some(elem => (elem.username === username) && elem.password === password)){
        return true;
    }else{
        return false;
    }
}

//function to create a new user, needs username, password, and the users 3 favourite genres to create the new user.
function signUp(username, password, genre1, genre2, genre3){
    //checks if the user with the username already exists and performs other checks to see if entry is valid
    if((username!= undefined && username.length>0)
        && !users.some(el => el.username.toLowerCase() === username.toLowerCase()) &&
        (password != undefined && password.length>0) &&
        (genre1!= undefined && genre1.length>0) && (genre2!= undefined && genre2.length>0  ) &&
        (genre3!= undefined && genre3.length>0)){
        //The genres entered are converted to a format that makes it easy for comparison with existing data, for example action -> Action
        let newString1 = (genre1.toLowerCase()).charAt(0).toUpperCase() + (genre1.toLowerCase()).slice(1);
        let newString2 = (genre2.toLowerCase()).charAt(0).toUpperCase() + (genre2.toLowerCase()).slice(1);
        let newString3 = (genre3.toLowerCase()).charAt(0).toUpperCase() + (genre3.toLowerCase()).slice(1);

        //if it passes the checks creates new user object, normal user by default
        let userObj = {
            userID: nextUserID, //unique user ID, uses the global ID to determine which to use
            username:username, //unique username
            password:password,
            isContributing: false, //Regular user by default
            followers: [], //array of follower's user ID's
            followingUsers: [], //array of users ID's the user is following
            followingPeople: [], //array of person ID's of the people they're following
            reviews:[], //array of the ID's of the reviews the user has made
            favouriteGenres: [newString1, newString2, newString3],
            recommendedMovies: [], //array of the titles of recommended movies for the user
            notifications: [], //array of users notifications
        }
        users.push(userObj);
        //generates the users recommendations using the recommendMoviesFunction()
        userObj.recommendedMovies = recommendMovies(nextUserID);
        nextUserID++; //increments the global user ID
        return true;
    }else{
        error();
        return false;
    }
}

//Allows the user to change user type from regular to contributing and vice-versa
function changeUserType(userID){
    if(users.some(elem => elem.userID === userID)){
        users[userID].isContributing = !users[userID].isContributing;
    }else{
        error();
        return null;
    }
}

//allows one user to follow another one, 2 arguments, the user who's trying to follow as first and the second of the user who is being followed
function followUser(userID, toFollowUserID){
    //checks if both users exist and the user doesn't already follow the other person, and then adds the ID's to the respective arrays
    if(users.some(elem => elem.userID === userID) &&
        users.some(elem => elem.userID === toFollowUserID)
        && userID != toFollowUserID && !users[userID].followingUsers.includes(toFollowUserID)){
        users[userID].followingUsers.push(toFollowUserID);
        users[toFollowUserID].followers.push(userID);
        return true;
    }else{
        error();
        return false;
    }
}

//allows a user to unfollow another user
function unfollowUser(userID, toUnfollowUserID){
    //ensures the user was following the other user in the first place and then removes from the required arrays
    if(users[userID].followingUsers.includes(toUnfollowUserID)){
        users[userID].followingUsers = users[userID].followingUsers.filter(elem => elem != toUnfollowUserID);
        users[toUnfollowUserID].followers = users[toUnfollowUserID].followers.filter(elem => elem != userID);
        return true;
    }else{
        error();
        return false;
    }
}

//gets a specific user by their ID
function getUserByID(userID){
    let found = users.find(elem => elem.userID === userID);
    return found;
}

//gets a specific user by their username
function getUserByName(username){
    if(username != undefined) {
        let found = users.find(elem => elem.username.toLowerCase() === username.toLowerCase());
        return found;
    }
    else{
        error();
        return null;
    }
}

//returns an array of users that have the searchParameter(string) in their usernames, limits to 10 results
function searchUsers(searchParameter){
    if(searchParameter != undefined) {
        let found = users.filter(elem => elem.username.toLowerCase().includes(searchParameter.toLowerCase()));
        return found.slice(0,10);
    }else{
        return null;
    }
} //include //returns array

//retrieves a specific users followers, argument is the unique user ID
function getUsersFollowers(userID){
    if(users.some(elem => elem.userID === userID)){
        let found = [];
        for(let i =0; i< users[userID].followers.length; i++){
            let follower = users[users[userID].followers[i]];
            found.push(follower.username);
        }
        return found;
    }else{
        return null;
    }
}

//retrieves a list of users a specific user follows
function getUsersFollowingUsersList(userID){
    if(users.some(elem => elem.userID === userID)){
        let found = [];
        for(let i =0; i< users[userID].followingUsers.length; i++){
            let following = users[users[userID].followingUsers[i]];
            found.push(following.username);
        }
        return found;
    }else{
        return null;
    }
}

//retrieves a list of the people a specific user follows
function getUsersFollowingPeopleList(userID){
    if(users.some(elem => elem.userID === userID)){
        let found = [];
        for(let i =0; i< users[userID].followingPeople.length; i++){
            let following = people[users[userID].followingPeople[i]];
            found.push(following.name);
        }
        return found;
    }else{
        return null;
    }
}

//Returns an array containing the review objects of the full reviews the specific user has made
function getUsersReviews(userID){
    if(users.some(elem => elem.userID === userID)){
        let found = [];
        for(let i =0; i< users[userID].reviews.length; i++){
            let review = reviews[users[userID].reviews[i]];
            found.push(review);
        }
        return found;
    }else{
        return null;
    }
}


/*//////////////////////////////////////////////REVIEW FUNCTIONS///////////////////////////////////*/

//helper function for the review functions, to calculate the average rating, using a movie's total rating
// and number of ratings
function calculateAvgRating(movieID,rating){
    movies[movieID].noOfRatings++;
    movies[movieID].totalRating += rating;
    movies[movieID].averageRating = movies[movieID].totalRating/movies[movieID].noOfRatings;
}

//function that allows a user to make a full review, specifying the arguments.
//Also send notifications to the followers of the person making the review
function addFullReview(userID, movieID, rating, summary, fullReview){
    //performs checks to ensure entry is valid and the movie and user exists
    if(users.some(elem => elem.userID === userID) && movies.some(elem => elem.movieID === movieID)
        && rating!=undefined && rating>=0 && rating<=10 && summary!=undefined && summary.length>0 && fullReview!=undefined && fullReview.length>0){

        //creates a review object and adds it to the reviews array
        let reviewObj = {
            reviewID: nextReviewID, //unique review ID
            userID: userID, //ID of the user that made the review
            username: getUserByID(userID).username,
            movieID: movieID, //The movie for which the review is being made
            summary: summary, //summary of review
            rating: rating, //rating out of 10
            fullReview: fullReview
        }
        reviews.push(reviewObj);
        movies[movieID].reviews.push(nextReviewID);
        users[userID].reviews.push(nextReviewID);
        let string = reviewObj.username + " added a review";
        console.log(string);
        //Adds a notification to the notifications array for each user that is following the person
        //making the review
        for(let i=0; i<users[userID].followers.length; i++){
            users[users[userID].followers[i]].notifications.unshift(string);
        }
        nextReviewID++;
        //calls calculateAvgRating function to update the rating of the movie
        calculateAvgRating(movieID,rating);
        return true;
    }
    else{
        error();
        return false;
    }
}

//function that allows user to make basic review with just the rating
function addBasicReview(userID, movieID, rating){
    if(users.some(elem=>elem.userID === userID) &&
        movies.some(elem => elem.movieID === movieID) && rating!=undefined && rating>=0 && rating<=10 ){
        calculateAvgRating(movieID,rating);
        return true;
    }else{
        error();
        return false;
    }
}

//retrieves a review object based on the reviewID entered
function getReviewByID(reviewID){
    let found = reviews.find(elem => elem.reviewID === reviewID);
    return found;
}

/*//////////////////////////////////////////////MOVIE FUNCTIONS///////////////////////////////////*/
//this function recommends movies to a user based on what favourite genres they entered when creating account
//returns max 10 results
function recommendMovies(userID){
    let recommended1 = [];
    let recommended2 =[];
    let recommended3 = [];
    let finalRecommended =[];
    if(users.some(elem => elem.userID === userID)){
        recommended1 = movies.filter(elem=>elem.genre.includes(users[userID].favouriteGenres[0]));
        recommended2 = movies.filter(elem=>elem.genre.includes(users[userID].favouriteGenres[1]));
        recommended3 = movies.filter(elem=>elem.genre.includes(users[userID].favouriteGenres[2]));
        finalRecommended = recommended1.concat(recommended2,recommended3);
        if(finalRecommended.length != 0) {
            finalRecommended = finalRecommended.map(elem => elem.title);
            finalRecommended = finalRecommended.filter(onlyUnique);
        }
    }
    //Uses the shuffle method defined at the top of the page using the Fisher-Yates algorithm
    //This is used so that the user isn't always recommended the same movies from the start of the array
    shuffle(finalRecommended);
    return finalRecommended.slice(0,10);
}

//searches a movie by seeing if the movie title includes the searchParameter, returns maximum 20 results
function searchMovie(searchParameter){
    if(searchParameter != undefined) {
        let found = movies.filter(elem => elem.title.toLowerCase().includes(searchParameter.toLowerCase()));
        return found.slice(0,20);
    }else{
        error();
        return null;
    }
}

//retrieves specific movie by its unique ID
function getMovieByID(movieID){
    let found = movies.find(elem => elem.movieID === movieID);
    return found;
}

//retrieves specific movie by its unique name
function getMovieByName(movieName){
    if(movieName != undefined) {
        let found = movies.find(elem => elem.title.toLowerCase() === movieName.toLowerCase());
        return found;
    }
    else{
        error();
        return null;
    }
}

//function that allows user to filter the search results when the user searches for movies
//this functionality is included in the search.html page of my website which has a drop down menu to select the criteria
//by which to filter. It accepts an array of movie objects(the search results), 2nd argument is to specify
//the criteria by which to sort the movies - Runtime. Year Released and average rating, 3rd argument is whether
//its descending or ascending

//Wasn't able to implement it into the actual web app because of pain with AJAX and partial page updates and time restrictions
//I thought it was a neat solution, look through if you want :)
function filterMovies(movieArray, criteria, order){
    if(movieArray !=undefined && movieArray.length != 0) {
        if (criteria === 'Runtime') {
            if(order === 'Ascending') {
                movieArray.sort(function(a, b){return parseInt(a.runtime) - parseInt(b.runtime)});
            }else if(order === 'Descending'){
                movieArray.sort(function(a, b){return parseInt(b.runtime) - parseInt(a.runtime)});
            }
        } else if (criteria === 'Year Released') {
            if(order === 'Ascending') {
                movieArray.sort(function (a, b) {return parseInt(a.yearReleased) - parseInt(b.yearReleased)});
            }
            else if(order === 'Descending'){
                movieArray.sort(function (a, b) {return parseInt(b.yearReleased) - parseInt(a.yearReleased)});
            }
        } else if (criteria === 'Average Rating') {
            if(order === 'Ascending') {
                movieArray.sort(function (a, b) {return a.averageRating - b.averageRating});
            }else if(order === 'Descending'){
                movieArray.sort(function (a, b) {return b.averageRating - a.averageRating});
            }
        }
        return movieArray;
    }
}

//Helper function for the addmovie function, adds the movie, role and collaborators to each peron in the movie being added
function addMovieHelper(person,role,movieID,otherPerson1,otherPerson2,otherPerson3,otherPerson4){
    let existingObj = getPersonByName(person);

    for(let i=0; i<users.length;i++){
        if(users[i].followingPeople.includes(existingObj.peopleID)){
            let string = existingObj.name + " has a new movie";
            users[i].notifications.unshift(string);
            users[i].notifications = users[i].notifications.filter(onlyUnique);
        }
    }
    existingObj.roles.push(role);
    existingObj.roles = existingObj.roles.filter(onlyUnique);
    existingObj.movies.push(movieID);
    existingObj.movies = existingObj.movies.filter(onlyUnique);
    if(person.toLowerCase() != otherPerson1.toLowerCase() && !existingObj.collaborators.some(elem => elem.toLowerCase() === otherPerson1.toLowerCase())){
        existingObj.collaborators.push(otherPerson1);
    }
    if(person.toLowerCase() != otherPerson2.toLowerCase() && !existingObj.collaborators.some(elem => elem.toLowerCase() === otherPerson2.toLowerCase())){
        existingObj.collaborators.push(otherPerson2);
    }
    if(person.toLowerCase() != otherPerson3.toLowerCase() && !existingObj.collaborators.some(elem => elem.toLowerCase() === otherPerson3.toLowerCase())){
        existingObj.collaborators.push(otherPerson3);
    }
    if(person.toLowerCase() != otherPerson4.toLowerCase() && !existingObj.collaborators.some(elem => elem.toLowerCase() === otherPerson4.toLowerCase())){
        existingObj.collaborators.push(otherPerson4);
    }
    existingObj.collaborators = existingObj.collaborators.filter(onlyUnique);
}

//function that allows a contributing user to add a movie to the database if that movie doesn't already exist.
function addMovie(userID, title, yearReleased, runtime, plot, genre1, genre2, actor1, actor2, actor3,  director, writer){
    if(users.some(elem => elem.userID === userID) && users[userID].isContributing === true
        && title != undefined
        && !movies.some(elem => elem.title.toLowerCase() === title.toLowerCase())
        && title.length>0
        && yearReleased != undefined && yearReleased.length>0
        && runtime != undefined && runtime.length>0 && plot != undefined && plot.length>0
        && genre1 != undefined && genre1.length>0 && genre2 != undefined && genre2.length>0
        && actor1 != undefined && actor1.length>0
        && actor2 != undefined && actor2.length>0 && actor3 != undefined && actor3.length>0
        && director != undefined && director.length>0 && writer != undefined && writer.length>0
        && people.some(elem => elem.name.toLowerCase() === actor1.toLowerCase())
        && people.some(elem => elem.name.toLowerCase() === actor2.toLowerCase())
        && people.some(elem => elem.name.toLowerCase() === actor3.toLowerCase())
        && people.some(elem => elem.name.toLowerCase() === director.toLowerCase())
        && people.some(elem => elem.name.toLowerCase() === writer.toLowerCase())){

        //Ensures the first letter for the genres are capitalized
        let newString1 = (genre1.toLowerCase()).charAt(0).toUpperCase() + (genre1.toLowerCase()).slice(1);
        let newString2 = (genre2.toLowerCase()).charAt(0).toUpperCase() + (genre2.toLowerCase()).slice(1);

        //Function that capitalizes the first letter of each word of the string passed in
        function capitalize(str){
            return str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1);
        }

        //Capitalizes every first letter of each word for every person in the movie
        actor1 = actor1.split(' ').map(capitalize).join(' ');
        actor2 = actor2.split(' ').map(capitalize).join(' ');
        actor3 = actor3.split(' ').map(capitalize).join(' ');
        director = director.split(' ').map(capitalize).join(' ');
        writer = writer.split(' ').map(capitalize).join(' ');

        //Calls the addMovieHelper for each person to add the movies to the existing person's work
        //add each other to the collaborators and if they have a new role, it is added to the list of their roles
        addMovieHelper(actor1,'Actor',nextMovieID,actor2,actor3,director,writer);
        addMovieHelper(actor2,'Actor',nextMovieID,actor1,actor3,director,writer);
        addMovieHelper(actor3,'Actor',nextMovieID,actor1,actor2,director,writer);
        addMovieHelper(director,'Director',nextMovieID,actor1,actor2,actor3,writer);
        addMovieHelper(writer,'Writer',nextMovieID,actor1,actor2,actor3,director);


        //Creates the movie object
        let movieObj = {
            movieID: nextMovieID,
            title: title,
            yearReleased: yearReleased,
            runtime: runtime,
            plot: plot,
            genre:[newString1,newString2],
            actors:[actor1,actor2,actor3],
            director:director,
            writers:[writer],
            reviews: [],
            similarMovies: [],
            noOfRatings: 0,
            totalRating: 0,
            averageRating: 0,
        };
        //Populates the similar movies array for the movie being added
        for(let i =0; i<movies.length; i++){
            if(movieObj.similarMovies.length >=10){
                break;
            }
            if(movies[i].genre.includes(newString1) || movies[i].genre.includes(newString2)){
                movieObj.similarMovies.push(movies[i].title);
            }
        }
        movies.push(movieObj);
        nextMovieID++;
        return true;
    }else{
        error();
        return false;
    }
}
//helper function for the addMovie API function
//this is for the public JSON API
//called for each person involved in the movie
function addMovieAPIHelper(person,role,movieID,otherPerson1,otherPerson2,otherPerson3,otherPerson4){
    if(!people.some(elem => elem.name.toLowerCase() === person.toLowerCase())){
        //If the person doesn't already exist, a new record is made for them
        let personObj = {
            peopleID: nextPeopleID,
            name: person,
            roles: [role],
            movies: [movieID],
            collaborators: [],
        }
        //Collaborators are added for them
        personObj.movies = personObj.movies.filter(onlyUnique);
        if(person.toLowerCase() != otherPerson1.toLowerCase() && !personObj.collaborators.some(elem => elem.toLowerCase() === otherPerson1.toLowerCase())){
            personObj.collaborators.push(otherPerson1);
        }
        if(person.toLowerCase() != otherPerson2.toLowerCase() && !personObj.collaborators.some(elem => elem.toLowerCase() === otherPerson2.toLowerCase())){
            personObj.collaborators.push(otherPerson2);
        }
        if(person.toLowerCase() != otherPerson3.toLowerCase() && !personObj.collaborators.some(elem => elem.toLowerCase() === otherPerson3.toLowerCase())){
            personObj.collaborators.push(otherPerson3);
        }
        if(person.toLowerCase() != otherPerson4.toLowerCase() && !personObj.collaborators.some(elem => elem.toLowerCase() === otherPerson4.toLowerCase())){
            personObj.collaborators.push(otherPerson4);
        }
        personObj.collaborators = personObj.collaborators.filter(onlyUnique);
        people.push(personObj);
        nextPeopleID++;
    }else{
        //If they exist, the movie is added to their works
        let existingObj = getPersonByName(person);
        existingObj.roles.push(role);
        existingObj.roles = existingObj.roles.filter(onlyUnique);
        existingObj.movies.push(movieID);
        existingObj.movies = existingObj.movies.filter(onlyUnique);
        if(person.toLowerCase() != otherPerson1.toLowerCase() && !existingObj.collaborators.some(elem => elem.toLowerCase() === otherPerson1.toLowerCase())){
            existingObj.collaborators.push(otherPerson1);
        }
        if(person.toLowerCase() != otherPerson2.toLowerCase() && !existingObj.collaborators.some(elem => elem.toLowerCase() === otherPerson2.toLowerCase())){
            existingObj.collaborators.push(otherPerson2);
        }
        if(person.toLowerCase() != otherPerson3.toLowerCase() && !existingObj.collaborators.some(elem => elem.toLowerCase() === otherPerson3.toLowerCase())){
            existingObj.collaborators.push(otherPerson3);
        }
        if(person.toLowerCase() != otherPerson4.toLowerCase() && !existingObj.collaborators.some(elem => elem.toLowerCase() === otherPerson4.toLowerCase())){
            existingObj.collaborators.push(otherPerson4);
        }
        existingObj.collaborators = existingObj.collaborators.filter(onlyUnique);
    }
}

//Add movie function for the public JSON API
//Can add movie even if people in the movie don't exist in the database yet
//Those people are added as new entries to the database
function addMovieAPI(title, yearReleased, runtime, plot, genre1, genre2, actor1, actor2, actor3,  director, writer){
    if(title != undefined && !movies.some(elem => elem.title.toLowerCase() === title.toLowerCase())
        && title.length>0
        && yearReleased != undefined && yearReleased.length>0
        && runtime != undefined && runtime.length>0 && plot != undefined && plot.length>0
        && genre1 != undefined && genre1.length>0 && genre2 != undefined && genre2.length>0
        && actor1 != undefined && actor1.length>0
        && actor2 != undefined && actor2.length>0 && actor3 != undefined && actor3.length>0
        && director != undefined && director.length>0 && writer != undefined && writer.length>0){

        let newString1 = (genre1.toLowerCase()).charAt(0).toUpperCase() + (genre1.toLowerCase()).slice(1);
        let newString2 = (genre2.toLowerCase()).charAt(0).toUpperCase() + (genre2.toLowerCase()).slice(1);

        //Capitalize function called for all the people input
        function capitalize(str){
            return str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1);
        }

        actor1 = actor1.split(' ').map(capitalize).join(' ');
        actor2 = actor2.split(' ').map(capitalize).join(' ');
        actor3 = actor3.split(' ').map(capitalize).join(' ');
        director = director.split(' ').map(capitalize).join(' ');
        writer = writer.split(' ').map(capitalize).join(' ');

        //Calls the helper function above for each person
        addMovieAPIHelper(actor1,'Actor',nextMovieID,actor2,actor3,director,writer);
        addMovieAPIHelper(actor2,'Actor',nextMovieID,actor1,actor3,director,writer);
        addMovieAPIHelper(actor3,'Actor',nextMovieID,actor1,actor2,director,writer);
        addMovieAPIHelper(director,'Director',nextMovieID,actor1,actor2,actor3,writer);
        addMovieAPIHelper(writer,'Writer',nextMovieID,actor1,actor2,actor3,director);


        let movieObj = {
            movieID: nextMovieID,
            title: title,
            yearReleased: yearReleased,
            runtime: runtime,
            plot: plot,
            genre:[newString1,newString2],
            actors:[actor1,actor2,actor3],
            director:director,
            writers:[writer],
            reviews: [],
            similarMovies: [],
            noOfRatings: 0,
            totalRating: 0,
            averageRating: 0,
        }
        for(let i =0; i<movies.length; i++){
            if(movieObj.similarMovies.length >=10){
                break;
            }
            if(movies[i].genre.includes(newString1) || movies[i].genre.includes(newString2)){
                movieObj.similarMovies.push(movies[i].title);
            }
        }
        movies.push(movieObj);
        nextMovieID++;
        return true;
    }else{
        error();
        return false;
    }
}

//Returns an array of max size 50 of movie objects that include the genre specified
function searchByGenre(genre){
    if(genre != undefined && genre.length>0){
        //after passing the above checks, the genre string is converted so the first letter is uppercase
        //and rest are lowercase and stored in a newString
        //The Sci-Fi genre is a special case since it doesn't follow usual formatting
        if(genre != "Sci-Fi"){
            let newString = (genre.toLowerCase()).charAt(0).toUpperCase() + (genre.toLowerCase()).slice(1);
            let found = movies.filter(elem=>elem.genre.includes(newString));
            //Shuffles the search results
            shuffle(found);
            //Returns max 50 results
            return found.slice(0,50);
        }else{
            let found = movies.filter(elem=>elem.genre.includes(genre));
            shuffle(found);
            return found.slice(0,50);
        }

    }else{
        error();
        return null;
    }
}

//Function that allows searching of movies based on different parameters, the functionality is for the REST API
//requirements mentioned in the project spec. Returns all matches
function getMoviesByQueryParameters(title, genre, year, minrating){
    let results = JSON.parse(JSON.stringify(movies));
    //if title is provided, it filter the movies to ones with titles that include the title argument provided
    if(title!= undefined){
        results = movies.filter(elem => elem.title.toLowerCase().includes(title.toLowerCase()));
    }
    //if genre is provided, it filters the array further to include only those with the specific genre provided
    if(genre != undefined){
        let newString = (genre.toLowerCase()).charAt(0).toUpperCase() + (genre.toLowerCase()).slice(1);
        results = results.filter(elem => elem.genre.includes(newString));
    }
    //if year is provided, it filters the array further to include only those released in the year specified
    if(year != undefined){
        results = results.filter(elem => elem.yearReleased === year);
    }
    //if minrating is provided, it filters the array further to include only those movies with specified minimum rating
    if(minrating != undefined){
        results = results.filter(elem => elem.averageRating >= parseFloat(minrating));
    }
    return results;
}

//gets the review objects for the reviews that have been made for the specified movie
function getMoviesReviews(movieID){
    if(movies.some(elem => elem.movieID === movieID)){
        let found = [];
        for(let i =0; i< movies[movieID].reviews.length; i++){
            let review = reviews[movies[movieID].reviews[i]];
            found.push(review);
        }
        return found;
    }else{
        return null;
    }
}

//function used to edit movies and add an actor
function addActor(userID, movieID, actor){
    //Capitalize function to be called for the people input - actors and writers
    function capitalize(str){
        return str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1);
    }
    //Capitalizes the first letter of each word for the people
    actor= actor.split(' ').map(capitalize).join(' ');
    if(users[userID].isContributing && people.some(elem => elem.name.toLowerCase() === actor.toLowerCase())
        && !movies[movieID].actors.some(elem => elem.toLowerCase() === actor.toLowerCase())){

        //Adds the actor to the movie
        movies[movieID].actors.push(actor);
        let id = getPersonByName(actor).peopleID;
        //Adds the movie and roles to the persons data
        if(!people[id].roles.includes('Actor')){
            people[id].roles.push('Actor')
        }
        if(!people[id].movies.includes(movieID)){
            people[id].movies.push(movieID)
        }
        //Adds the notification for all the users who follow the person
        for(let i=0; i<users.length;i++){
            if(users[i].followingPeople.includes(id)){
                let string = actor + " has a new movie";
                //Adds the newest notification at the top
                users[i].notifications.unshift(string);
                users[i].notifications = users[i].notifications.filter(onlyUnique);
            }
        }
        return true;
    }else{
        return false;
    }

}
//function used to edit movies and add a writer
//Similar to the addActor function above
function addWriter(userID, movieID, writer){
    function capitalize(str){
        return str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1);
    }
    writer = writer.split(' ').map(capitalize).join(' ');
    if(users[userID].isContributing && people.some(elem => elem.name.toLowerCase() === writer.toLowerCase())
        && !movies[movieID].writers.some(elem => elem.toLowerCase() === writer.toLowerCase())){

        movies[movieID].writers.push(writer);
        let id = getPersonByName(writer).peopleID;
        if(!people[id].roles.includes('Writer')){
            people[id].roles.push('Writer')
        }
        if(!people[id].movies.includes(movieID)){
            people[id].movies.push(movieID)
        }
        for(let i=0; i<users.length;i++){
            if(users[i].followingPeople.includes(id)){
                let string = writer + " has a new movie";
                users[i].notifications.unshift(string);
                users[i].notifications = users[i].notifications.filter(onlyUnique);
            }
        }
        return true;
    }else{
        return false;
    }
}

/*//////////////////////////////////////////////PEOPLE FUNCTIONS///////////////////////////////////*/
//Function that allows a contributing to add a person to the database if they don't exist already
function addPerson(userID, personName, role){
    if( users.some(elem => elem.userID === userID) && users[userID].isContributing === true
        &&personName != undefined && personName.length>0 && role != undefined
        && !people.some(elem => elem.name.toLowerCase() === personName.toLowerCase())){

        function capitalize(str){
            return str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1);
        }

        role = role.split(' ').map(capitalize).join(' ');
        personName = personName.split(' ').map(capitalize).join(' ');

        let personObj = {
            peopleID: nextPeopleID,
            name: personName,
            roles: [role],
            movies: [],
            collaborators: [],
        }
        people.push(personObj);
        nextPeopleID++;
        return true;
    }else{
        error();
        return false;
    }
}

//allows a user to follow a person, if they exist in the database
function followPerson(userID, toFollowPersonID){
    if(users.some(elem => elem.userID === userID) &&
        people.some(elem => elem.peopleID === toFollowPersonID)
        && !users[userID].followingPeople.includes(toFollowPersonID)){
        users[userID].followingPeople.push(toFollowPersonID);
        return true;
    }else{
        error();
        return false;
    }
}

//allows a user to unfollow a person if they were actually following them
function unfollowPerson(userID, toUnfollowPersonID){
    if(users.some(elem => elem.userID === userID) && users[userID].followingPeople.includes(toUnfollowPersonID)){
        users[userID].followingPeople = users[userID].followingPeople.filter(elem => elem != toUnfollowPersonID);
        return true;
    }else{
        error();
        return false;
    }
}

//retrieves a specific person by using their ID
function getPersonByID(personID){
    let found = people.find(elem => elem.peopleID === personID);
    return found;
}

//retrieves a specific person by using their name
function getPersonByName(name){
    if(name != undefined) {
        let found = people.find(elem => elem.name.toLowerCase() === name.toLowerCase());
        return found;
    }
    else{
        error();
        return null;
    }
}

//returns an array of people with names that include the searchParameter, all results from database, returns people objects
function searchPeople(searchParameter){
    if(searchParameter != undefined) {
        let found = people.filter(elem => elem.name.toLowerCase().includes(searchParameter.toLowerCase()));
        return found;
    }else{
        error();
        return null;
    }
}

//gets the specified persons movies they've been involved in, returns array of movie titles
function getPersonsMovies(personID){
    if(people.some(elem => elem.peopleID === personID)){
        let found = [];
        for(let i =0; i< people[personID].movies.length; i++){
            let movie = movies[people[personID].movies[i]];
            found.push(movie.title);
        }
        return found;
    }else{
        error();
        return null;
    }
}

//Starting script to create some users for the program, follows each other
function initializationScript(){
    signUp('NolanFan123', 'abc123', 'action', 'Sci-Fi','comedy');
    signUp('TarantinoFan123', 'abc123', 'Action', 'western', 'comedy');
    signUp('TarantinoHater123', 'abc123', 'drama', 'Sci-Fi', 'fantasy');
    signUp('jakesilver', 'abc123','romance', 'Western','Drama');

    followUser(0,3);
    followUser(1,3);
    followUser(2,3);
    followUser(3,0);
    followUser(2,0);
    followUser(1,0);
    followUser(3,1);
    followUser(3,2);

    followPerson(3,45);
    followPerson(3,46);
    followPerson(3,1);

    addBasicReview(0,0,7);
    addBasicReview(1,0,9);
    addBasicReview(2,9,6);
    addFullReview(0,0,7.5,'Magical Moments','My childhood story. Buzz light year and woody is epic');
}

//Exports all the functions and variables needed
module.exports = {
    movieData,
    users,
    people,
    movies,
    reviews,
    nextUserID,
    nextMovieID,
    nextPeopleID,
    nextReviewID,
    onlyUnique,
    initServer,
    initializationScript,
    error,
    authUser,
    signUp,
    changeUserType,
    followUser,
    unfollowUser,
    getUserByID,
    getUserByName,
    searchUsers,
    getUsersFollowers,
    getUsersFollowingUsersList,
    getUsersFollowingPeopleList,
    getUsersReviews,
    calculateAvgRating,
    addBasicReview,
    addFullReview,
    getReviewByID,
    recommendMovies,
    searchMovie,
    getMovieByID,
    getMovieByName,
    filterMovies,
    addMovie,
    addMovieAPI,
    addMovieAPIHelper,
    searchByGenre,
    getMoviesByQueryParameters,
    getMoviesReviews,
    addActor,
    addWriter,
    addPerson,
    followPerson,
    unfollowPerson,
    getPersonByID,
    getPersonByName,
    searchPeople,
    getPersonsMovies
}












