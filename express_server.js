const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

//                      STORAGE
// =======================================================

// // Stores database of URLs
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "shwi43" },
  i45Ufs: { longURL: "https://www.reddit.com", userID: "123" }
};

// Stores database of user information
const users = { 
  "userRandomID": {
    id: "123", 
    email: "user@example.com", 
    password: "qwe"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

//                      FUNCTIONS
// =======================================================

// Genarates a random string of 6 letter
const generateRandomString = function() {
  let randomString = "";
  const characterList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
    if (users[id]["email"] === userEmail) {
      return true;
    }
  }
  return false;
};

// Returns the ID associated with user"s email
const getIDByEmail = function(userEmail) {
  for (const id in users) {
    if (users[id]["email"] === userEmail) {
      return users[id];
    }
  }
};

// Checks User Id and return only URLs associated with that ID
const urlsForUser = function(userID, urlDatabase) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

// Get user object by user ID
const getUserById = function(userId) {
  for (const id in users) {
    return users[id]["id"];
  }
  
}

//                          GET REQUESTS
// =========================================================

// Creates new page
app.get("/urls/new", (req, res) => {
  if (users[req.cookies.user_id]) {
    const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
} else {
  res.redirect("/login")
}
  
});

// Creates the page for each URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL, 
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

// Creates login page
app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("login", templateVars);
});

// Creates registration page
app.get("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user_id] 
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
  const userID =  req.cookies.user_id;
  const user = users[userID];
  const userURLs = urlsForUser(userID, urlDatabase);
  const templateVars = { 
      urls: userURLs,
      user: user
    }
    res.render("urls_index", templateVars);   
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
    const userID = addNewUser(email, password, users);
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

// Saves the login info to the website
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (checkEmailExists(email) === false) {
    res.status(403).send("Error: Couldn't find an account with that email!");
  }  else if (bcrypt.compareSync(password, getIDByEmail(email)["password"])) {
    const userID = getIDByEmail(email)["id"];
    res.cookie("user_id", userID);
    res.redirect("/urls");
  } else {
    res.status(403).send("Error: Incorrect Password!");
  }
});

// Allows user to logout and clear the cookie from the website
app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.user_ID);
  res.redirect("/urls");
});

// Saves new URLs to main page database
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID: users[req.cookies.user_id]["id"]
  };
  res.redirect(`/urls/${newShortURL}`);
});

// Allows user to delete a URL from database
app.post("/urls/:url_id/delete", (req, res) => {
  if (users[req.cookies.user_id]) {
    delete urlDatabase[req.params.url_id];
    res.redirect("/urls");
  } else {
    res.status(405).send("Error: You don't have permission to do that!")
  }
});

// Saves updated long URL to the shortened URL webpage
app.post("/urls/:shortURL", (req, res) => {
  if (users[req.cookies.user_id]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL
    res.redirect("/urls");
  } else {
    res.status(405).send("Error: You don't have permission to do that!")
  }
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