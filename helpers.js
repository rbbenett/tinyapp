const { urlDatabase, userDatabase } = require('./databaseObj');


//                     HELPER FUNCTIONS
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
const addNewUser = function(email, password, userDatabase) {
  let userID = generateRandomString();
  const newUser = {
    "id": userID,
    "email": email,
    "password": password
  };
  userDatabase[userID] = newUser;
  return userID;
};

// Checks to see if email is already in database
const checkEmailExists = function(userEmail) {
  for (const id in userDatabase) {
    if (userDatabase[id]["email"] === userEmail) {
      return true;
    }
  }
  return false;
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

// Returns the ID associated with user"s email
const getUserByEmail = function(userEmail, userDatabase) {
  for (const id in userDatabase) {
    if (userDatabase[id]["email"] === userEmail) {
      return userDatabase[id];
    }
  }
};

const getUserById = function(userId) {
  return userDatabase[userId];
}

module.exports = { urlDatabase, userDatabase, getUserByEmail, addNewUser, checkEmailExists, urlsForUser, generateRandomString, getUserById };