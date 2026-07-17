const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

// Protect all dashboard routes
router.use(authMiddleware);

router.get("/stats", dashboardController.getStats);
router.get("/charts", dashboardController.getCharts);
router.get("/latest-inspections", dashboardController.getLatestInspections);

module.exports = router;
