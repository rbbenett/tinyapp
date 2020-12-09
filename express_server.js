const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

//                      STORAGE
// =======================================================

// Stores database of URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Stores database of user information
const users = {};

//                      FUNCTIONS
// =======================================================

// Genarates a random string of 6 letter
const generateRandomString = function() {
  let randomString = '';
  const characterList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let x = 0; x < 6; x += 1) {
    randomString += characterList.charAt(Math.floor(Math.random() * characterList.length));
  }
  return randomString;
};

// Adds new user to database
const addNewUser = function(email, password, database) {
  let userID = generateRandomString();
  const newUser = {
    "id": userID,
    "email": email,
    "password": password
  };
  users[userID] = newUser;
  return userID;
};

// Checks to see if email is already in database
const checkEmailExists = function(userEmail) {
  for (const id in users) {
    if (users[id]['email'] === userEmail) {
      return true;
    }
  }
  return false;
};

// Checks to see if password is already in database
const checkPasswordExists = function(password) {
  for (const id in users) {
    if (users[id]["password"] === password) {
      return true;
    }
  }
  return false;
};

// Returns the ID associated with user's email
const getIDByEmail = function(userEmail) {
  for (const id in users) {
    if (users[id]['email'] === userEmail) {
      return users[id]["id"];
    }
  }
};

//                          GET REQUESTS
// =========================================================

// Creates new page
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render("urls_new", templateVars);
});

// Creates the page for each URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies['user_id']]};
  res.render("urls_show", templateVars);
});

// Creates login page
app.get('/login', (req, res) => {
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render('login', templateVars);
});

// Creates registration page
app.get('/register', (req, res) => {
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render('register', templateVars);
});

// Adds new shortened URL page to database
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const fullURL = urlDatabase[req.params.shortURL];
    res.redirect(fullURL);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Creates main page showing all the URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  res.render("urls_index", templateVars);
});

//                        POST REQUESTS
// =========================================================

// Saves new user registration to database
app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (email === "" | password === "") {
    res.status(400).send("Error: Please fill in both fields!");
  } else if (checkEmailExists(email)) {
    res.status(400).send("Error: This email already exists!");
  } else {
    const userID = addNewUser(email, password, users);
    res.cookie('user_id', userID);
    res.redirect('/urls');
  }
});

// Saves the login info to the website
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (checkEmailExists(email) === false) {
    res.status(403).send("Error: Couldn't find an account with that email!");
  } else if (checkEmailExists(email) === true && checkPasswordExists(password) === false) {
    res.status(403).send("Error: Incorrect Password!");
  } else {
    const userID = getIDByEmail(email);
    res.cookie('user_id', userID);
    res.redirect('/urls');
  }
});

// Allows user to logout and clear the cookie from the website
app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.body.user_ID);
  res.redirect('/urls');
});

// Saves new URLs to main page database
app.post('/urls', (req, res) => {
  const newShortURL = generateRandomString();
  const newLongURL = req.body.longURL;
  urlDatabase[newShortURL] = `${newLongURL}`;
  res.redirect('http://localhost:8080/urls/');
});

// Allows user to delete a URL from database
app.post('/urls/:url_id/delete', (req, res) => {
  delete urlDatabase[req.params.url_id];
  res.redirect('/urls');
});

// Saves long URL to the shortened URL webpage
app.post('/urls/:url_id', (req, res) => {
  const key = req.params.url_id;
  const longURL = req.body.longURL;
  urlDatabase[key] = longURL;
  res.redirect('/urls');
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});