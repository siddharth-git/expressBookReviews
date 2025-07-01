const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
  "username": "sidd",
  "password": "123"
},
{
  "username": "Arpi",
  "password": "1234"
}];

const isValid = (username)=>{
  return !users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  console.log(users.some((user) => user.username === username && user.password === password));
  return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
   const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Validate credentials
  if (authenticatedUser(username, password)) {
    // Create JWT token
    let accessToken = jwt.sign(
      { username: username },
      'access', // Secret key (must match verification in index.js)
      { expiresIn: '1h' }
    );

    // Save token in session
    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "User successfully logged in." });
  } else {
    return res.status(401).json({ message: "Invalid login credentials." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
  const review = req.query.review;;

  if (!req.session || !req.session.authorization.username) {
    return res.status(401).json({ message: "User not authenticated review." });
  }

  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review content is required as a query parameter." });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully.", reviews: book.reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Check if user is logged in
  if (!req.session || !req.session.authorization || !req.session.authorization.username) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  const username = req.session.authorization.username;

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Check if the user has posted a review
  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ message: "Your review has been deleted." });
  } else {
    return res.status(404).json({ message: "No review found for this user on the specified book." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
