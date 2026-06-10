const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/stats", dashboardController.getStats);
router.get("/charts", dashboardController.getCharts);
router.get("/latest-inspections", dashboardController.getLatestInspections);

module.exports = router;
