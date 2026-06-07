const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all inspections
router.get("/", (req, res) => {
  const query = "SELECT * FROM container_inspections ORDER BY date DESC";
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching inspections:", err);
      return res.status(500).json({ error: "Failed to fetch inspections" });
    }
    res.json(result);
  });
});

// Create new inspection
router.post("/", (req, res) => {
  const {
    container,
    shipName,
    status,
    iso,
    category,
    condition,
    side,
    note,
    photo1,
    photo2,
    petugas,
    group,
    date
  } = req.body;

  if (!container || !shipName || !condition || !petugas || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO container_inspections (
      container,
      shipName,
      status,
      iso,
      category,
      \`condition\`,
      side,
      note,
      photo1,
      photo2,
      petugas,
      \`group\`,
      \`date\`
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Format date to MySQL datetime in Asia/Jakarta (WIB) timezone
  const dateObj = new Date(date);
  const tzDate = new Date(dateObj.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const formattedDate = [
    tzDate.getFullYear(),
    String(tzDate.getMonth() + 1).padStart(2, '0'),
    String(tzDate.getDate()).padStart(2, '0')
  ].join('-') + ' ' + [
    String(tzDate.getHours()).padStart(2, '0'),
    String(tzDate.getMinutes()).padStart(2, '0'),
    String(tzDate.getSeconds()).padStart(2, '0')
  ].join(':');

  db.query(
    query,
    [
      container.trim().toUpperCase(),
      shipName.trim(),
      status,
      iso,
      category,
      condition,
      side,
      note,
      photo1,
      photo2,
      petugas,
      group || "Lapangan",
      formattedDate
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating inspection:", err);
        return res.status(500).json({ error: "Failed to save inspection" });
      }
      res.json({ message: "Inspection saved successfully", id: result.insertId });
    }
  );
});

// Delete inspection by id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM container_inspections WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting inspection:", err);
      return res.status(500).json({ error: "Failed to delete inspection" });
    }
    res.json({ message: "Inspection deleted successfully" });
  });
});

module.exports = router;