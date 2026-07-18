const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createAvailability,
  getAllAvailability,
  getAvailabilityByProvider,
  updateAvailability,
  deleteAvailability,
} = require("../controllers/availabilityController");

router.post("/", protect, createAvailability);
router.get("/", getAllAvailability);
router.get("/:providerId", getAvailabilityByProvider);
router.put("/:id", protect, updateAvailability);
router.delete("/:id", protect, deleteAvailability);

module.exports = router;
