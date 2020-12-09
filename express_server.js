const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

// Genarates a random string of 6 letter
const generateRandomString = function() {
  let randomString = '';
  const characterList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let x = 0; x < 6; x += 1) {
    randomString += characterList.charAt(Math.floor(Math.random() * characterList.length));
  }
  return randomString;
};

// Stores database of URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Stores database of user information
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// Add new user to database
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

const checkEmailExists = function(userEmail) {
  for (const id in users) {
    if (users[id]['email'] === userEmail) {
      return true;
    }
  }
  return false;
};

// Creates new page
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies['userID']]};
  res.render("urls_new", templateVars);
});

// Creates the page for each URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies['userID']]};
  res.render("urls_show", templateVars);
});

// Creates login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Creates registration page
app.get('/register', (req, res) => {
  res.render('register');
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
  const templateVars = { urls: urlDatabase, user: users[req.cookies['userID']] };
  res.render("urls_index", templateVars);
});

// Saves the login info to the website
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

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
    res.cookie('userID', userID);
    res.redirect('/urls');
  }
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

// Allows user to logout and clear the cookie from the website
app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.username);
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