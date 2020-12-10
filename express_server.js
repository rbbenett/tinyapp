const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const { getUserByEmail, addNewUser, checkEmailExists, urlsForUser, generateRandomString } = require('./helpers');
const { urlDatabase, userDatabase } = require('./databaseObj');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");

//                          GET REQUESTS
// =========================================================

// Creates new page
app.get("/urls/new", (req, res) => {
  if (userDatabase[req.session.user_id]) {
    const templateVars = {
      user: userDatabase[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Creates the page for each URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user: userDatabase[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

// Creates login page
app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: userDatabase[req.session.user_id]
  };
  res.render("login", templateVars);
});

// Creates registration page
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: userDatabase[req.session.user_id]
  };
  res.render("register", templateVars);
});

// Adds new shortened URL page to database
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Creates main page showing all the URLs
app.get("/urls", (req, res) => {
  const userID =  req.session.user_id;
  const user = userDatabase[userID];
  const userURLs = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urls: userURLs,
    user: user
  };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  if (userDatabase[req.session.user_id]) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//                        POST REQUESTS
// =========================================================

// Saves new user registration to database
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  if (email === "" | password === "") {
    res.status(400).send("Error: Please fill in both fields!");
  } else if (checkEmailExists(email)) {
    res.status(400).send("Error: This email already exists!");
  } else {
    const userID = addNewUser(email, password, userDatabase);
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

// Saves the login info to the website
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (checkEmailExists(email) === false) {
    res.status(403).send("Error: Couldn't find an account with that email!");
  }  else if (bcrypt.compareSync(password, getUserByEmail(email, userDatabase)["password"])) {
    const userID = getUserByEmail(email, userDatabase)["id"];
    req.session.user_id = userID;
    res.redirect("/urls");
  } else {
    res.status(403).send("Error: Incorrect Password!");
  }
});

// Allows user to logout and clear the session from the website
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Saves new URLs to main page database
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID: userDatabase[req.session.user_id]["id"]
  };
  res.redirect(`/urls/${newShortURL}`);
});

// Allows user to delete a URL from database
app.delete("/urls/:url_id/delete", (req, res) => {
  if (userDatabase[req.session.user_id]) {
    delete urlDatabase[req.params.url_id];
    res.redirect("/urls");
  } else {
    res.status(405).send("Error: You don't have permission to do that!");
  }
});

// Saves updated long URL to the shortened URL webpage
app.put("/urls/:shortURL", (req, res) => {
  if (userDatabase[req.session.user_id]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(405).send("Error: You don't have permission to do that!");
  }
});

///////////////////////////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});