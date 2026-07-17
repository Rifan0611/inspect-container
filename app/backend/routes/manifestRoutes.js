const express = require("express");
const router = express.Router();
const manifestController = require("../controllers/manifestController");
const authMiddleware = require("../middleware/authMiddleware");

// Protect all manifest routes
router.use(authMiddleware);

router.get("/manifest", manifestController.getManifest);
router.post("/manifest", manifestController.saveManifest);

module.exports = router;