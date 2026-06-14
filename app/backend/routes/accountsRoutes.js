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

// Bulk create accounts
router.post("/accounts/batch", (req, res) => {
  const users = req.body;
  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ error: "Invalid payload or empty list" });
  }

  const values = [];
  const placeholders = [];
  for (const user of users) {
    const { username, password, jabatan, nama, group } = user;
    if (!username || !password || !jabatan || !nama || !group) {
      return res.status(400).json({ error: `Missing required fields for user: ${username || 'unknown'}` });
    }
    placeholders.push("(?, ?, ?, ?, ?)");
    values.push(username.trim(), password.trim(), jabatan, nama.trim(), group.trim());
  }

  const query = `INSERT INTO accounts (username, password, jabatan, nama, \`group\`) VALUES ${placeholders.join(", ")}`;
  db.query(query, values, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Salah satu username sudah terdaftar!" });
      }
      console.error("Error bulk creating accounts:", err);
      return res.status(500).json({ error: "Failed to create accounts in bulk" });
    }
    res.json({ success: true, message: `${result.affectedRows} accounts created successfully` });
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

// Update account password
router.put("/accounts/:username/password", (req, res) => {
  const { username } = req.params;
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  db.query("UPDATE accounts SET password = ? WHERE username = ?", [password.trim(), username], (err, result) => {
    if (err) {
      console.error("Error updating password:", err);
      return res.status(500).json({ error: "Failed to update password" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.json({ message: "Password updated successfully" });
  });
});

module.exports = router;
