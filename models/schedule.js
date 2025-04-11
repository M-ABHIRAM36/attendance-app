const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  periodNo: Number,
  subject: String,
  startTime: String,     // e.g. "09:20"
  endTime: String,       // e.g. "10:10"
  active: {
    type: Boolean,
    default: true
  },
  isLab: {
    type: Boolean,
    default: false
  }
});

const scheduleSchema = new mongoose.Schema({
  date: {
    type: String,        // Format: "YYYY-MM-DD"
    required: true,
    unique: true
  },
  dayName: {
    type: String,        // e.g. "Monday"
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  periods: [periodSchema],
  totalClasses: {
    type: Number,
    default: 0
  },
  totalActiveClasses: {
    type: Number,
    default: 0
  },  
  totalTime: {
    type: Number,        // in minutes
    default: 0
  },
  isHoliday: {
    type: Boolean,
    default: false
  },
  holidayReason: String
});

module.exports = mongoose.model('Schedule', scheduleSchema);
