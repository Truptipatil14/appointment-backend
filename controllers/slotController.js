const Availability = require("../models/Availability");
const Appointment = require("../models/Appointment");
const generateSlots = require("../utils/slotGenerator");

const getAvailableSlots = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const selectedDate = new Date(date);

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

    let slots = generateSlots(
      availability.startTime,
      availability.endTime,
      availability.slotDuration,
    );

    const appointments = await Appointment.find({
      providerId,
      appointmentDate: selectedDate,
      status: { $nin: ["Cancelled"] },
    });

    slots = slots.filter((slot) => {
      return !appointments.some(
        (appointment) =>
          appointment.startTime === slot.startTime &&
          appointment.endTime === slot.endTime,
      );
    });

    return res.status(200).json({
      success: true,
      date,
      slots,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAvailableSlots,
};
