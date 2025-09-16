const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  getUsers,
  getUserById,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

// User Managent Routes
router.get("/", protect, adminOnly, getUsers); // get all users (admin only)
router.get("/:id", protect, getUserById); //get a specific user

module.exports = router;
