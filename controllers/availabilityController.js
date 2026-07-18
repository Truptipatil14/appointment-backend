const Availability = require("../models/Availability");

const validDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Create Availability
const createAvailability = async (req, res) => {
  try {
    const {
      providerId,
      dayOfWeek,
      startTime,
      endTime,
      slotDuration,
      isAvailable,
    } = req.body;

    if (!providerId || !dayOfWeek || !startTime || !endTime || !slotDuration) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!validDays.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: "Invalid day selected",
      });
    }

    if (slotDuration <= 0) {
      return res.status(400).json({
        success: false,
        message: "Slot duration must be greater than zero",
      });
    }

    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time",
      });
    }

    const availability = await Availability.create({
      providerId,
      dayOfWeek,
      startTime,
      endTime,
      slotDuration,
      isAvailable,
    });

    res.status(201).json({
      success: true,
      message: "Availability created successfully",
      data: availability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
      
        
   
// Get All Availability
const getAllAvailability = async (req, res) => {
  try {
    const data = await Availability.find().populate("providerId", "name email");

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAvailabilityByProvider = async (req, res) => {
  try {
    const data = await Availability.find({
      providerId: req.params.providerId,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const updated = await Availability.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    res.json({
      success: true,
      message: "Availability updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAvailability = async (req, res) => {
  try {
    const deleted = await Availability.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    res.json({
      success: true,
      message: "Availability deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAvailability,
  getAllAvailability,
  getAvailabilityByProvider,
  updateAvailability,
  deleteAvailability,
};