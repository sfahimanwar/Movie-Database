Sheikh Fahim Anwar
Student number - 101141744
Movie Database Project

The documentation for the public JSON API and how to use it is at the bottom section of the README

All the dependencies have been installed for the application.
When starting the server, it'll take some time to actually run because it's initializing the server with the movie data.
Furthermore, I took some assumptions while parsing the JSON data, for example - that each movie has only one director.
The system when initializing, creates some users for the website. You may create your own account but here are some premades-
Username,Password -
jakesilver, abc123 (suggest to use this one)
NolanFan123, abc123
TarantinoHater123, abc123
TarantinoFan123, abc123

One review has been made for Toy Story in the initialization script, so if you want to see how a review looks on a page, search for toy story.
The review was made by NolanFan123, so to see the review on their page, navigate to their profile.


*********************************************************** DIRECTORY STRUCTURE ***********************************************************************
Folders-

project -
    node_modules
    public - Contains all the static files served by the server
        - client.js - The client side js file
        - favicon.png - The favicon for the website
        - website.css - The stylesheet for the website
        - website-logo.png - PNG file of the website logo

    views - contains all the pug pages used for the website
        - addmovie.pug - the pug file used to render the page for contributing to the database
        - footer.pug - partial for the footer of each page
        - home.pug - pug file for home page
        - movie.pug - pug file movie view page
        - navbar.pug - partial for the navbar at the top of each page
        - people.pug - pug file for viewing a person
        - profile.pug - pug file for viewing users own profile page
        - search.pug - pug file for displaying search results
        - signin.pug - pug file for displaying the signin page
        - signup.pug - pug file displaying the signup page
        - user.pug - pug file displaying the view of other users

    business_logic.js - the js file containing all the business logic, the functions and variables are exported as a module
    movie-data.json - the initial JSON file of movie information provided to us
    server.js - The main express server
    publicAPI-router.js - This router handles all the requests for all the Public JSON API outlined in the project document,
    can be tested using Postman or through the browser

***********************************************************************************************************************************
The PUBLIC JSON API - **** NOT THE MAIN PROGRAM THE USER USES THROUGH INTERFACE ****
The API follows the instructions in the project specification.
This part of the program is in addition to the API required for a user to interact the through the web pages and interface.
It is the Public API to retrieve movie data without logging into the system.
I tested this using Postman
For testing the Public JSON API, all requests should be made starting with the the route /api
For example - http://localhost:9999/api/movie/:movie To access a specific movie

PUBLIC API ROUTES -
****************************************************      GET     ****************************************************
Returns data about a SPECIFIC movie -  /api/movies/:movie  The movie parameter is the name of the movie, if the movie has spaces between words, it has to be entered with spaces,
it can also be entered in any case for example-  /api/movie/toy story

All movies - /api/movies  Returns all the movies in the database if no query parameter is provided
- has optional query parameters - title, genre, year, minrating as described in the project specification
- for example /api/movies?title=toy story&year=2010  - returns any movie with toy story in title and released in 2010
- for example /api/movies?genre=horror&year=2014  - returns any horror movie released in 2014
-for example /api/movies?title=3 returns any movie with 3 in the title

Returns data about a SPECIFIC person -  /api/people/:person  The person parameter is the name of the person, the person can be entered with spaces between
the words and in any case for example-  /api/people/robin williams

All people - /api/people Returns all the people in the database if no query parameter is provided
- has optional query parameter - name, as described in the project specification
- for example /api/people?name=john  - returns any person with john in their name

Returns data about a specific user -  /api/users/:user The user parameter is the username of the user
- for example -   /api/users/jakesilver

All users - /api/users Returns all the users in the database if no query parameter is provided
- has optional query parameter - name, as described in the project specification
- for example /api/users?name=tarantino   - returns any user with tarantino in their username

****************************************************      POST     ****************************************************

/api/movies

Used to add a movie to the database, needs a JSON representation of a movie, if the movie added has people not in the
database, they're added to the database too. JSON data is checked for validity by the server. Multiple checks are made.

The JSON data needs title, year, runtime, plot, genre1, genre2, actor1, actor2, actor3, director, writer
runtime is entered using mins - 80 min, 120 min
For example -
{
"title": "Mean Machiato",
"year": "2010",
"runtime": "120 min",
"plot": "Cup of coffee makes everyone poop",
"genre1": "Action",
"genre2": "Romance",
"actor1": "Chris Evans",
"actor2": "Ulrich Nielsen",
"actor3": "Ben Banooza",
"director": "John Lasseter",
"writer": "John Lasseter"
}













