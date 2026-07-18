const generateSlots = (startTime, endTime, slotDuration) => {
  const slots = [];

  const toMinutes = (time) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };

  const toTime = (minutes) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  let start = toMinutes(startTime);
  const end = toMinutes(endTime);

  while (start + slotDuration <= end) {
    slots.push({
      startTime: toTime(start),
      endTime: toTime(start + slotDuration),
    });

    start += slotDuration;
  }

  return slots;
};

module.exports = generateSlots;