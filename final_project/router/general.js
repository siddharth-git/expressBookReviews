const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

let registeredUsers = [];
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }
  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res
      .status(409)
      .json({ message: "Username already exists. Please choose another." });
  }
  users.push({ username, password });

  return res.status(200).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  const fetchBooks = () => {
    return new Promise((resolve, reject) => {
      resolve(books);
    });
  };

  const allBooks = await fetchBooks();
  return res.status(200).json(allBooks);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  const isbn = req.params.isbn;
  const getBookByISBN = () => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
    });
  };

  try {
    const book = await getBookByISBN();
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author.toLowerCase();
  const getBooksByAuthor = () => {
    return new Promise((resolve, reject) => {
      const matchingBooks = [];

      for (const isbn in books) {
        if (books[isbn].author.toLowerCase() === author) {
          matchingBooks.push({ isbn, ...books[isbn] });
        }
      }

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found for this author");
      }
    });
  };

  try {
    const authorBooks = await getBooksByAuthor();
    res.status(200).json({ books: authorBooks });
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  const title = req.params.title.toLowerCase();
  const getBooksByTitle = () => {
    return new Promise((resolve, reject) => {
      const matchingBooks = [];

      for (const isbn in books) {
        if (books[isbn].title.toLowerCase() === title) {
          matchingBooks.push({ isbn, ...books[isbn] });
        }
      }

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found with this title");
      }
    });
  };

  try {
    const result = await getBooksByTitle();
    res.status(200).json({ books: result });
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.status(200).json({ reviews: book.reviews });
  }
});

module.exports.general = public_users;
