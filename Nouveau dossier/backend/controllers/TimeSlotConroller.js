// controllers/timeSlotController.js
import { TimeSlotTemplate } from "../models/TimeSlotTemplate.js";
import { TimeSlotInstance } from "../models/TimeSlotInstance.js";
import mongoose, { isValidObjectId } from "mongoose";
import axios from "axios";

const timeToMinutes = (time) => {
  if (!time || typeof time !== "string" || !time.match(/^\d{2}:\d{2}$/)) {
    throw new Error(`Invalid time format: ${time}`);
  }
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time value: ${time}`);
  }
  return hours === 0 && minutes === 0 ? 1439 : hours * 60 + minutes;
};

// Helper to generate dates between two dates for specific days
export const generateSlotDates = (startDate, endDate, daysOfWeek) => {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  current.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(23, 59, 59, 999);
  const numericDaysOfWeek = daysOfWeek.map(day => parseInt(day, 10)); // Convert strings to numbers
  while (current <= end) {
    if (numericDaysOfWeek.includes(current.getUTCDay())) {
      dates.push(new Date(current));
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
};
export const getWorkingHours = async (parkId, date) => {
  try {
    let response;
    console.log("parkId is :",parkId)

    if (date) {
      response = await axios.get(`http://localhost:8000/api/parks/${parkId}/working-hours/?date=${date}`);
    } else {
      response = await axios.get(`http://localhost:8000/api/parks/${parkId}/working-hours`);
    }
    return response.data.workingHours;
  } catch (error) {
    console.error(`Error fetching working hours for ${date}:`, error.response?.data || error.message);
    return null;
  }
};

export const checkOverlap = async (req, res) => {
  try {
    const {
      parkId,
      validFrom,
      validUntil,
      startTime,
      endTime,
      daysOfWeek,
      pricingIds,
    } = req.body;

    // Validate required fields
    if (!parkId || !validFrom || !validUntil || !startTime || !endTime || !daysOfWeek?.length || !pricingIds?.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (parkId,validFrom,validUntil, startTime, endTime, daysOfWeek, pricingId)"
      });
    }

    // Convert times to minutes for comparison
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    // Check template-level conflicts
    const templateConflicts = await TimeSlotTemplate.find({
      parkId,
      daysOfWeek: { $in: daysOfWeek },
      pricingIds: { $in: pricingIds }, // <-- added condition here
      $or: [
        { validUntil: { $gte: new Date(validFrom) } },
        { validUntil: null }
      ],
      $or: [
        // New slot starts during existing slot
        { 
          startTime: { $lt: endTime }, 
          endTime: { $gt: startTime } 
        },
        // New slot completely contains existing slot
        { 
          startTime: { $gte: startTime },
          endTime: { $lte: endTime }
        },
        // New slot completely within existing slot
        { 
          startTime: { $lte: startTime },
          endTime: { $gte: endTime }
        }
      ]
    });

    // Check instance-level conflicts for specific dates
    const instanceConflicts = await TimeSlotInstance.find({
      'templateId.parkId': parkId,
      date: { 
        $gte: new Date(validFrom),
        $lte: validUntil ? new Date(validUntil) : new Date('2100-01-01')
      },
      $or: [
        { 
          'templateId.startTime': { $lt: endTime },
          'templateId.endTime': { $gt: startTime }
        }
      ]
    }).populate('templateId');

    // Format conflicts for response
    const conflicts = [
      ...templateConflicts.map(t => ({
        type: 'template',
        id: t._id,
        days: t.daysOfWeek,
        time: `${t.startTime}-${t.endTime}`,
        validFrom: t.validFrom,
        validUntil: t.validUntil
      })),
      ...instanceConflicts.map(i => ({
        type: 'instance',
        id: i._id,
        date: i.date,
        time: `${i.templateId.startTime}-${i.templateId.endTime}`,
        templateId: i.templateId._id,
        priceAdjustment
      }))
    ];

    res.json({
      success: true,
      hasOverlap: conflicts.length > 0,
      conflicts,
      newSlot: {
        daysOfWeek,
        timeRange: `${startTime}-${endTime}`,
        validFrom,
        validUntil: validUntil || 'ongoing'
      }
    });

  } catch (error) {
    console.error('Overlap check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking for overlaps',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create template with instances
// Updated createTemplate function in timeSlotController.js
export const createTemplate = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { startTime, endTime, daysOfWeek, validFrom, validUntil, ticketLimit ,pricingIds,      priceAdjustment
    } = req.body;
    const {parkId} = req.params;
    // const hours = await getWorkingHours(parkId)
    // Validate working hours for each selected day
    const referenceDates = {
      0: "2023-01-01", // Sunday
      1: "2023-01-02", // Monday
      2: "2023-01-03", // Tuesday
      3: "2023-01-04", // Wednesday
      4: "2023-01-05", // Thursday
      5: "2023-01-06", // Friday
      6: "2023-01-07", // Saturday
    };

    let commonWorkingHours = null;
    const dayNames = [];
    
    // Check working hours for each selected day
    for (const day of daysOfWeek) {
      const referenceDate = referenceDates[day];
      if (!referenceDate) {
        throw new Error(`Invalid day number: ${day}`);
      }
      const workingHours = await getWorkingHours(parkId, referenceDate);

      // Check if park is closed on this day
      if (!workingHours || workingHours.closed) {
        const dayName = new Date(referenceDate).toLocaleDateString('en-US', { weekday: 'long' });
        throw new Error(`Park is closed on ${dayName}`);
      }

      // Convert working hours to minutes
      const workStart = timeToMinutes(workingHours.from);
      const workEnd = timeToMinutes(workingHours.to);
      const slotStart = timeToMinutes(startTime);
      const slotEnd = timeToMinutes(endTime);

      // Validate slot times
      if (slotStart < workStart || slotEnd > workEnd) {
        throw new Error(`Time slot (${startTime}-${endTime}) falls outside working hours (${workingHours.from}-${workingHours.to})`);
      }

      // Check consistent working hours across days
      if (!commonWorkingHours) {
        commonWorkingHours = workingHours;
      } else if (
        workingHours.from !== commonWorkingHours.from ||
        workingHours.to !== commonWorkingHours.to
      ) {
        throw new Error('Selected days have different working hours');
      }

      dayNames.push(new Date(referenceDate).toLocaleDateString('en-US', { weekday: 'long' }));
    }

    // Proceed with template creation
    const template = await TimeSlotTemplate.create([{
      parkId,
      startTime,
      endTime,
      pricingIds,
      daysOfWeek,
      validFrom: new Date(validFrom),
      validUntil: validUntil ? new Date(validUntil) : null,
      ticketLimit,
      priceAdjustment

    }], { session });

    // Generate instances
    const dates = generateSlotDates(
      new Date(validFrom),
      validUntil ? new Date(validUntil) : new Date(8640000000000000),
      daysOfWeek
    );

    const instances = dates.map(date => ({
      templateId: template[0]._id,
      date,
      availableTickets: ticketLimit,
      ticketLimit
    }));

    await TimeSlotInstance.insertMany(instances, { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: `Template created for ${dayNames.join(', ')}`,
      workingHours: `${commonWorkingHours.from} - ${commonWorkingHours.to}`,
      template
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: error.message,
      errorType: 'Working Hours Validation Failed'
    });
  } finally {
    session.endSession();
  }
};

// Update template and instances
export const updateTemplate = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const template = await TimeSlotTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, session }
    );

    // Regenerate instances if days or dates changed
    if (req.body.daysOfWeek || req.body.validFrom || req.body.validUntil) {
      // Delete old instances
      await TimeSlotInstance.deleteMany({ templateId: template._id }, { session });

      // Create new instances
      const dates = generateSlotDates(
        template.validFrom,
        template.validUntil || new Date(8640000000000000),
        template.daysOfWeek
      );

      const instances = dates.map(date => ({
        templateId: template._id,
        date,
        availableTickets: template.ticketLimit,
        ticketLimit: template.ticketLimit
      }));

      await TimeSlotInstance.insertMany(instances, { session });
    }

    await session.commitTransaction();
    res.json(template);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// Get availability for specific date
export const getAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = new Date(date);
    
    const instances = await TimeSlotInstance.find({
      date: {
        $gte: new Date(targetDate.setUTCHours(0, 0, 0, 0)),
        $lte: new Date(targetDate.setUTCHours(23, 59, 59, 999))
      }
    }).populate({
      path: 'templateId',
      match: { parkId: req.params.parkId },
      populate: { path: 'pricingIds' }
    });

    const results = instances
      .filter(instance => instance.templateId)
      .map(instance => ({
        id: instance._id,
        startTime: instance.templateId.startTime,
        endTime: instance.templateId.endTime,
        availableTickets: instance.availableTickets,
        pricing: instance.templateId.pricingIds,
        priceAdjustment: instance.templateId.priceAdjustment
      }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete template and instances
export const deleteTemplate = async (req, res) => {
  const {id} = req.params.id;
  if(!id || !isValidObjectId(id)) {
    return res.status(400).json({ error: "ID parameter is required" });
  }
  try {
    const template = await TimeSlotTemplate.findByIdAndDelete(id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    // Delete all instances associated with this template
    await TimeSlotInstance.deleteMany({ templateId: id });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update instance availability
export const updateInstance = async (req, res) => {
  try {
    const instance = await TimeSlotInstance.findByIdAndUpdate(
      req.params.id,
      { availableTickets: req.body.availableTickets },
      { new: true, runValidators: true }
    ).populate('templateId');

    if (!instance) return res.status(404).json({ error: "Instance not found" });
    res.json(instance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const getInstances = async (req, res) => {
  try {
    if (req.query.instanceId) {
      const id =req.query.instanceId
      if(!isValidObjectId(id))
      {
        return res.status(400).json({ error: "id not valid" });
      }
      const instance = await TimeSlotInstance.findById(id).populate('templateId');
      if (!instance) {
        return res.status(404).json({ error: "Instance not found" });
      }
      return res.status(200).json({success:true,instance})
    }
    const { parkId, date, pricingId } = req.query;
    // Construct the filter object
    const filter = {};
    if (date) {
      const targetDate = new Date(date);
      filter.date = {
        $gte: new Date(targetDate.setUTCHours(0, 0, 0, 0)),
        $lte: new Date(targetDate.setUTCHours(23, 59, 59, 999))
      };
    }

    // Query for the instances based on the constructed filter
    // Populate the templateId field and filter by parkId and pricingId if provided
    const instances = await TimeSlotInstance.find(filter)
      .populate({
        path: 'templateId',
        match: {
          ...(parkId && { parkId }),
          ...(pricingId && { pricingIds: pricingId })
        }
      });

    // Filter out instances where the populated templateId is null
    const filteredInstances = instances.filter(instance => instance.templateId);

    if (!filteredInstances || filteredInstances.length === 0) {
      return res.status(404).json({ error: "Instances not found" });
    }

    res.json(filteredInstances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//get all templates
export const getTemplates = async (req, res) => {
  try {
    const params = req.query;
    const { date, pricingId, dayOfWeek ,id} = params;

    // Construct the filter object
    const filter = { parkId: req.params.parkId };

    // Filter by date if provided
    if (date) {
      const targetDate = new Date(date);
      filter.validFrom = { $lte: targetDate }; // Ensure the template's validFrom is on or before the target date
      filter.validUntil = { $gte: targetDate }; // Ensure the template's validUntil is on or after the target date
    }
    if(id) {
      if (!isValidObjectId(id)) {
        return res.status(400).json({ error: "ID parameter is required" });
      }
      filter._id = id; // Match the specific template ID
    }

    // Filter by pricingId if provided
    if (pricingId) {
      filter.pricingIds = pricingId; // Match templates that have the specific pricingId
    }

    // Filter by dayOfWeek if provided
    if (dayOfWeek !== undefined) {
      const targetDay = parseInt(dayOfWeek, 10); // Ensure it's a valid integer
      filter.daysOfWeek = { $in: [targetDay] }; // Match templates that apply to the specific day of the week
    }

    // Query for the templates based on the constructed filter
    const templates = await TimeSlotTemplate.find(filter).populate('pricingIds');

    if (templates.length > 0) {
      return res.status(200).json(templates);
    } else {
      return res.status(404).json({ message: "No templates found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


