// seedSchedule.js
require('dotenv').config();
const mongoose = require('mongoose');
const Schedule = require('../models/schedule');

mongoose.connect(process.env.ATLASDB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const timetable = {
  Monday: [
    { periodNo: 1, subject: "ML", startTime: "09:20", endTime: "10:10" },
    { periodNo: 2, subject: "WAD", startTime: "10:10", endTime: "11:00" },
    { periodNo: 3, subject: "DMS", startTime: "11:10", endTime: "12:00" },
    { periodNo: 4, subject: "OS",  startTime: "12:00", endTime: "12:50" },
    { periodNo: 5, subject: "DMS LAB", startTime: "01:30", endTime: "03:10", isLab: true }
  ],
  Tuesday: [
    { periodNo: 1, subject: "OS", startTime: "09:20", endTime: "10:10" },
    { periodNo: 2, subject: "ML", startTime: "10:10", endTime: "11:00" },
    { periodNo: 3, subject: "WAD", startTime: "11:10", endTime: "12:00" },
    { periodNo: 4, subject: "DMS", startTime: "12:00", endTime: "12:50" }
  ],
  Wednesday: [
    { periodNo: 1, subject: "ML", startTime: "09:20", endTime: "10:10" },
    { periodNo: 2, subject: "DMS LAB / WAD LAB", startTime: "10:10", endTime: "12:50", isLab: true },
    { periodNo: 3, subject: "DMS", startTime: "1:30", endTime: "2:20" },
    { periodNo: 4, subject: "MC", startTime: "2:20", endTime: "3:50" },

  ],
  Thursday: [
    { periodNo: 1, subject: "DMS", startTime: "09:20", endTime: "10:10" },
    { periodNo: 2, subject: "OS", startTime: "10:10", endTime: "11:00" },
    { periodNo: 3, subject: "ML", startTime: "11:10", endTime: "12:00" },
    { periodNo: 4, subject: "WAD", startTime: "12:00", endTime: "12:50" },
    { periodNo: 5, subject: "OS", startTime: "1:30", endTime: "2:20" }
  ],
  Friday: [
    { periodNo: 1, subject: "BC LAB", startTime: "09:20", endTime: "11:00", isLab: true },
    { periodNo: 2, subject: "OS", startTime: "11:10", endTime: "12:00" },
    { periodNo: 3, subject: "ML", startTime: "12:00", endTime: "12:50" },
    { periodNo: 4, subject: "WAD", startTime: "1:30", endTime: "2:20" },
  ],
  Saturday: [
    { periodNo: 1, subject: "WAD", startTime: "09:20", endTime: "10:10" },
    { periodNo: 2, subject: "DMS", startTime: "10:10", endTime: "11:00" },
    { periodNo: 3, subject: "ML-T", startTime: "11:10", endTime: "12:00" },
    { periodNo: 4, subject: "OS", startTime: "12:00", endTime: "12:50" },
    { periodNo: 5, subject: "Minor Project", startTime: "1:30", endTime: "3:50" }
  ]
};

const getDayName = (date) =>
  new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

const calculateTime = (periods) => {
  let total = 0;
  for (const p of periods) {
    const [sh, sm] = p.startTime.split(":").map(Number);
    const [eh, em] = p.endTime.split(":").map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    total += mins;
  }
  return total;
};

const startDate = new Date('2025-04-09');
const numDays = 29; // 3 weeks worth of data

const getTotalClasses = (periods) => {
  return periods.reduce((acc, p) => {
    const subject = p.subject.toLowerCase();

    if (p.isLab) return acc + 3;
    if (subject.includes("minor project")) return acc + 3;
    if (subject.includes("bc lab")) return acc + 2;
    if (subject.includes("mc")) return acc + 2;

    return acc + 1;
  }, 0);
};

const getTotalActiveClasses = (periods) => {
  return periods.reduce((acc, p) => {
    if (p.active === false) return acc; // skip inactive periods

    const subject = p.subject.toLowerCase();

    if (p.isLab) return acc + 3;
    if (subject.includes("minor project")) return acc + 3;
    if (subject.includes("bc lab")) return acc + 2;
    if (subject.includes("mc")) return acc + 2;

    return acc + 1;
  }, 0);
};


const run = async () => {
  await Schedule.deleteMany({});


  
  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const iso = date.toISOString().split('T')[0];
    const dayName = getDayName(date);

    // const periods = timetable[dayName] || [];

    const periods = timetable[dayName] || [];
    const totalClasses = getTotalClasses(periods);
    const totalActiveClasses = getTotalActiveClasses(periods);
    const totalTime = calculateTime(periods);

    await Schedule.create({
      date: iso,
      dayName,
      periods,
      totalClasses,
      totalActiveClasses,
      totalTime,
      isHoliday: false
    });

    console.log(`Seeded schedule for ${dayName} (${iso})`);
  }

  mongoose.disconnect();
};

run();
