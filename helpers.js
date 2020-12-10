// Returns the ID associated with user"s email
const getUserByEmail = function(userEmail, userDatabase) {
  for (const id in userDatabase) {
    if (userDatabase[id]["email"] === userEmail) {
      return userDatabase[id];
    }
  }
};

module.exports = { getUserByEmail };