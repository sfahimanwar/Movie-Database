//Gets the HTML button element for changing user type on the profile page
let changeAccountTypeButton = document.getElementById("change-user-type");
//Gets the text for the user type the user currently is
let accountTypeText = document.getElementById("user-type");

//Function that handles the changing of user type when the button is clicked
function changeAccountType() {
  //Creates and sends an AJAX request
  fetch("/user/changeUserType", {
    method: "PUT",
  })
    .then(() => {
      location.reload(true);
      alert("You've changed your account type");
    })
    .catch((err) => {
      console.log(err);
    });
}

if (changeAccountTypeButton != null) {
  changeAccountTypeButton.onclick = changeAccountType;
}

//Gets the HTML element for the add movie button in the profile page
let addMovieDirectButton = document.getElementById("add-movie");

//Function that redirects user to addmovie page
function addMovieDirect() {
  window.location.href = "/addmovie.html";
}

if (addMovieDirectButton != null) {
  addMovieDirectButton.onclick = addMovieDirect;
}

let followText;
let name;
//Gets the HTML button element for following person on a persons page
let followPersonButton = document.getElementById("follow-person");

if (followPersonButton != null) {
  followText = followPersonButton.textContent;
  name = document.getElementById("person-name").textContent;
  followPersonButton.onclick = followPersonToggle;
}

//function that handles the following and unfollowing of a person
function followPersonToggle() {
  //Created an object to be sent containing the name of the person of the page they're currently on
  let userObj = { name: name };

  //Sends different AJAX requests based on whether user is following them or not
  if (followText === "Follow") {
    fetch("/people/followPerson", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userObj),
    })
      .then(() => {
        location.reload(true);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    fetch("/people/unfollowPerson", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userObj),
    })
      .then(() => {
        location.reload(true);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
