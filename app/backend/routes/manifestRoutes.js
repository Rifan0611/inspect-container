const express = require("express");

const router = express.Router();

const manifestController = require("../controllers/manifestController");

router.get("/manifest", manifestController.getManifest);

router.post("/manifest", manifestController.saveManifest);

module.exports = router;