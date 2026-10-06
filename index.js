require("dotenv").config();
const express = require("express");
const main = require("./Mangose");
const User = require("./models/user");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // --- 1. IN-MEMORY BOOKS ARRAY & ENDPOINTS ---
// let books = [
//   { id: 1, title: "The Alchemist", author: "Paulo Coelho" },
//   { id: 2, title: "Atomic Habits", author: "James Clear" },
// ];

// // GET /books - Return all books
// app.get("/books", (req, res) => {
//   res.json(books);
// });

// // GET /books/:id - Return single book by ID
// app.get("/books/:id", (req, res) => {
//   const bookId = parseInt(req.params.id);
//   const book = books.find((b) => b.id === bookId);
//   if (!book) return res.status(404).json({ message: "Book not found" });
//   res.json(book);
// });

// // POST /books - Add a new book from request body
// app.post("/books", (req, res) => {
//   const { title, author } = req.body;
//   if (!title || !author) {
//     return res.status(400).json({ message: "Title and author are required" });
//   }
//   const newBook = {
//     id: books.length > 0 ? Math.max(...books.map((b) => b.id)) + 1 : 1,
//     title,
//     author,
//   };
//   books.push(newBook);
//   res.status(201).json({ message: "Book added successfully", book: newBook });
// });

// // PUT /books/:id - Update a book by ID
// app.put("/books/:id", (req, res) => {
//   const bookId = parseInt(req.params.id);
//   const bookIndex = books.findIndex((b) => b.id === bookId);
//   if (bookIndex === -1) return res.status(404).json({ message: "Book not found" });

//   const { title, author } = req.body;
//   if (title) books[bookIndex].title = title;
//   if (author) books[bookIndex].author = author;

//   res.json({ message: "Book updated successfully", book: books[bookIndex] });
// });

// // DELETE /books/:id - Remove a book by ID
// app.delete("/books/:id", (req, res) => {
//   const bookId = parseInt(req.params.id);
//   const bookIndex = books.findIndex((b) => b.id === bookId);
//   if (bookIndex === -1) return res.status(404).json({ message: "Book not found" });

//   const deletedBook = books.splice(bookIndex, 1)[0];
//   res.json({ message: "Book deleted successfully", book: deletedBook });
// });


// --- 2. MONGODB USER ENDPOINTS (/info) ---

// GET /info
app.get("/info", async (req, res) => {
  try {
    const ans = await User.find({});
    res.json(ans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching data", error: err.message });
  }
});

// POST /info
app.post("/info", async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "Request body is empty. Send JSON or x-www-form-urlencoded data.",
      });
    }

    const newdata = new User(req.body);
    const savedUser = await newdata.save();

    res.status(201).json({
      message: "Data saved successfully",
      data: savedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error saving data",
      error: err.message,
    });
  }
});

// DELETE /info
app.delete("/info", async (req, res) => {
  try {
    const { _id, name } = req.body;
    const filter = {};
    if (_id) filter._id = _id;
    else if (name) filter.name = name;
    else if (req.query.name) filter.name = req.query.name;

    if (Object.keys(filter).length === 0) {
      return res.status(400).json({
        message: "Please specify _id or name (in body or query) to delete.",
      });
    }

    const result = await User.deleteOne(filter);
    res.json({
      message: "Data deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error deleting data",
      error: err.message,
    });
  }
});

app.delete("/info/:id", async (req, res) => {
  try {
    if (!require("mongoose").Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: `Invalid ObjectId format "${req.params.id}". MongoDB _id must be a 24-character hex string. For numeric IDs (like 101), use DELETE http://localhost:3000/books/${req.params.id}`,
      });
    }
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Data deleted successfully", data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting data", error: err.message });
  }
});

// PUT /info
app.put("/info", async (req, res) => {
  try {
    const { _id, name, ...updateData } = req.body;
    const filter = {};
    if (_id) filter._id = _id;
    else if (name) filter.name = name;

    if (Object.keys(filter).length === 0) {
      return res.status(400).json({
        message: "Please specify _id or name in the request body to update.",
      });
    }

    const result = await User.updateOne(filter, { $set: updateData });
    res.json({
      message: "Data updated successfully",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error updating data",
      error: err.message,
    });
  }
});

app.put("/info/:id", async (req, res) => {
  try {
    if (!require("mongoose").Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: `Invalid ObjectId format "${req.params.id}". MongoDB _id must be a 24-character hex string. For numeric IDs (like 101), use PUT http://localhost:3000/books/${req.params.id}`,
      });
    }
    const result = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Data updated successfully", data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating data", error: err.message });
  }
});

// Start DB connection & Express Server
main()
  .then(() => {
    console.log("connected to db");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });
