const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  bookAppointment,
  getMyAppointments,
  getProviderAppointments,
  cancelAppointment,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

router.post("/", protect, bookAppointment);
router.get("/my", protect, getMyAppointments);
router.get("/provider", protect, getProviderAppointments);
router.put("/:id/cancel", protect, cancelAppointment);
router.put("/:id/status", protect, updateAppointmentStatus);

module.exports = router;
