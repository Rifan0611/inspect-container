const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

// Login Endpoint
router.post("/accounts/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const query = "SELECT * FROM accounts WHERE LOWER(TRIM(username)) = ?";
  db.query(query, [username.trim().toLowerCase()], async (err, result) => {
    if (err) {
      console.error("Login database error:", err);
      return res.status(500).json({ error: "Database error during login" });
    }

    if (result.length === 0) {
      return res.status(401).json({ error: "Username tidak ditemukan" });
    }

    const account = result[0];
    
    // Check password
    let validPassword = false;
    try {
      if (account.password.startsWith("$2a$") || account.password.startsWith("$2b$")) {
        // Hashed password
        validPassword = await bcrypt.compare(password.trim(), account.password);
      } else {
        // Plain text fallback (for migration)
        validPassword = password.trim() === account.password.trim();
      }
    } catch (e) {
      console.error("Password verification error:", e);
    }

    if (!validPassword) {
      return res.status(401).json({ error: "Password salah" });
    }

    const token = jwt.sign(
      {
        id: account.id,
        username: account.username,
        role: account.jabatan,
        nama: account.nama,
        group: account.group
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login Success",
      token,
      user: {
        nama: account.nama,
        role: account.jabatan,
        username: account.username,
        group: account.group
      }
    });
  });
});

// Get all accounts (Protected, hides password hashes)
router.get("/accounts", authMiddleware, (req, res) => {
  db.query("SELECT id, username, jabatan, nama, `group`, created_at FROM accounts ORDER BY id ASC", (err, result) => {
    if (err) {
      console.error("Error fetching accounts:", err);
      return res.status(500).json({ error: "Failed to fetch accounts" });
    }
    res.json(result);
  });
});

// Create new account (Protected)
router.post("/accounts", authMiddleware, async (req, res) => {
  const { username, password, jabatan, nama, group } = req.body;
  if (!username || !password || !jabatan || !nama || !group) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const query = "INSERT INTO accounts (username, password, jabatan, nama, `group`) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [username.trim(), hashedPassword, jabatan, nama.trim(), group.trim()], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Username already exists" });
        }
        console.error("Error creating account:", err);
        return res.status(500).json({ error: "Failed to create account" });
      }
      res.json({ message: "Account created successfully", id: result.insertId });
    });
  } catch (e) {
    console.error("Hashing password error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Bulk create accounts (Protected)
router.post("/accounts/batch", authMiddleware, async (req, res) => {
  const users = req.body;
  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ error: "Invalid payload or empty list" });
  }

  try {
    const values = [];
    const placeholders = [];
    for (const user of users) {
      const { username, password, jabatan, nama, group } = user;
      if (!username || !password || !jabatan || !nama || !group) {
        return res.status(400).json({ error: `Missing required fields for user: ${username || 'unknown'}` });
      }
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      placeholders.push("(?, ?, ?, ?, ?)");
      values.push(username.trim(), hashedPassword, jabatan, nama.trim(), group.trim());
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
  } catch (e) {
    console.error("Hashing batch passwords error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete account by username (Protected)
router.delete("/accounts/:username", authMiddleware, (req, res) => {
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

// Update account password (Protected)
router.put("/accounts/:username/password", authMiddleware, async (req, res) => {
  const { username } = req.params;
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    db.query("UPDATE accounts SET password = ? WHERE username = ?", [hashedPassword, username], (err, result) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ error: "Failed to update password" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json({ message: "Password updated successfully" });
    });
  } catch (e) {
    console.error("Hashing password error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
