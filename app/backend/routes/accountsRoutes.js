const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all accounts
router.get("/accounts", (req, res) => {
  db.query("SELECT * FROM accounts ORDER BY id ASC", (err, result) => {
    if (err) {
      console.error("Error fetching accounts:", err);
      return res.status(500).json({ error: "Failed to fetch accounts" });
    }
    res.json(result);
  });
});

// Create new account
router.post("/accounts", (req, res) => {
  const { username, password, jabatan, nama, group } = req.body;
  if (!username || !password || !jabatan || !nama || !group) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = "INSERT INTO accounts (username, password, jabatan, nama, `group`) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [username.trim(), password.trim(), jabatan, nama.trim(), group.trim()], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Username already exists" });
      }
      console.error("Error creating account:", err);
      return res.status(500).json({ error: "Failed to create account" });
    }
    res.json({ message: "Account created successfully", id: result.insertId });
  });
});

// Delete account by username
router.delete("/accounts/:username", (req, res) => {
  const { username } = req.params;
  if (username === "adminRAL") {
    return res.status(400).json({ error: "Cannot delete primary admin account" });
  }

  db.query("DELETE FROM accounts WHERE username = ?", [username], (err, result) => {
    if (err) {
      console.error("Error deleting account:", err);
      return res.status(500).json({ error: "Failed to delete account" });
    }
    res.json({ message: "Account deleted successfully" });
  });
});

module.exports = router;
