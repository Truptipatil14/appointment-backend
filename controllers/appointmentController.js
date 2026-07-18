const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");
const generateSlots = require("../utils/slotGenerator");

const bookAppointment = async (req, res) => {
  try {
    const { providerId, appointmentDate, startTime, reason } = req.body;

    if (!providerId || !appointmentDate || !startTime || !reason) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const selectedDate = new Date(appointmentDate);
    const dayName = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const availability = await Availability.findOne({
      providerId,
      dayOfWeek: dayName,
      isAvailable: true,
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Provider is not available on selected day",
      });
    }

    const slots = generateSlots(
      availability.startTime,
      availability.endTime,
      availability.slotDuration,
    );

    const matchedSlot = slots.find((slot) => slot.startTime === startTime);

    if (!matchedSlot) {
      return res.status(400).json({
        success: false,
        message: "Selected time is not a valid slot for this provider",
      });
    }

    const existing = await Appointment.findOne({
      providerId,
      appointmentDate: selectedDate,
      startTime,
      status: { $nin: ["Cancelled"] },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This slot has already been booked",
      });
    }

    const appointment = await Appointment.create({
      userId: req.user._id,
      providerId,
      appointmentDate: selectedDate,
      startTime: matchedSlot.startTime,
      endTime: matchedSlot.endTime,
      reason,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Appointments booked by the logged-in user
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate("providerId", "name email")
      .sort({ appointmentDate: 1, startTime: 1 });

    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Appointments booked with the logged-in provider
const getProviderAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ providerId: req.user._id })
      .populate("userId", "name email")
      .sort({ appointmentDate: 1, startTime: 1 });

    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// User or provider cancels an appointment
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    const isOwner = appointment.userId.toString() === req.user._id.toString();
    const isProvider =
      appointment.providerId.toString() === req.user._id.toString();

    if (!isOwner && !isProvider) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled",
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Provider updates status (Confirmed / Completed)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Confirmed", "Completed", "Cancelled"];

    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    if (appointment.providerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    appointment.status = status;
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment updated",
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getProviderAppointments,
  cancelAppointment,
  updateAppointmentStatus,
};
