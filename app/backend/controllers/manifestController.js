const db = require("../config/db");

exports.saveManifest = (req, res) => {
  const data = req.body;

  db.query("TRUNCATE TABLE manifests", (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    if (!data || !data.length) {
      return res.json({ success: true });
    }

    let selesai = 0;

    data.forEach((item) => {
      db.query(
        `INSERT INTO manifests (container, shipName, status, iso, category) VALUES (?, ?, ?, ?, ?)`,
        [item.container, item.shipName, item.status, item.iso, item.category],
        (err) => {
          if (err) {
            console.error("Insert error:", err.message);
          }

          selesai++;

          if (selesai === data.length) {
            res.json({ success: true });
          }
        }
      );
    });
  });
};

exports.getManifest = (req, res) => {
  db.query("SELECT * FROM manifests", (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    res.json(results);
  });
};
