import Park from "../models/ParkShcema.js"; // Adjust path based on your folder structure

const getFullDayHours = async (parkId, date) => {
  // Convert the input date to a Date object
  const inputDate = new Date(date);

  // Find the park by ID
  const park = await Park.findById(parkId);
  if (!park) throw new Error("Park not found");

  // Check if the date falls within a special period
  const specialPeriod = park.specialPeriods.find((period) => {
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    return inputDate >= startDate && inputDate <= endDate;
  });

  // Get the day of the week (e.g., "Monday", "Tuesday")
  const dayOfWeek = inputDate.toLocaleDateString("en-US", { weekday: "long" });

  // If the date is within a special period
  if (specialPeriod) {
    // Check if the day is open during the special period
    if (!specialPeriod.openDays.includes(dayOfWeek)) {
      throw new Error(`The park is closed on ${dayOfWeek} during the special period`);
    }

    // Use the special period hours
    return {
      fullDayStart: specialPeriod.hours.from,
      fullDayEnd: specialPeriod.hours.to,
    };
  }

  // If no special period, check if the day is closed
  if (park.closedDays.includes(dayOfWeek)) {
    throw new Error(`The park is closed on ${dayOfWeek}`);
  }

  // Get custom hours for the day (if available)
  const customHours = park.customHours.get(dayOfWeek);

  // Use custom hours if available, otherwise use default hours
  const fullDayStart = customHours ? customHours.from : park.defaultHours.from;
  const fullDayEnd = customHours ? customHours.to : park.defaultHours.to;

  return { fullDayStart, fullDayEnd };
};

export default getFullDayHours;