const express = require('express');
const router = express.Router();
const Schedule = require('../models/schedule.js');

// 🗓️ View calendar-like admin dashboard
router.get('/', async (req, res) => {
  const schedules = await Schedule.find({}).sort({ date: 1 });

  // 💡 Helper function to calculate weighted class count
  function calculateClassCount(periods, onlyActive = false) {
    return periods.reduce((acc, p) => {
      if (onlyActive && p.active === false) return acc;

      const subject = p.subject.toLowerCase();

      if (p.isLab) return acc + 3;
      if (subject.includes("minor project")) return acc + 3;
      if (subject.includes("bc lab")) return acc + 2;
      if (subject.includes("mc")) return acc + 2;

      return acc + 1;
    }, 0);
  }

  // Add total and active class count to each schedule
  schedules.forEach(s => {
    s.totalClassCount = calculateClassCount(s.periods);
    s.totalActiveClassCount = calculateClassCount(s.periods, true);
  });

  res.render('admin', { schedules });
});


// ✏️ Edit a specific date
router.get('/edit/:date', async (req, res) => {
  const schedule = await Schedule.findOne({ date: req.params.date });
  if (!schedule) return res.redirect('/admin');
  res.render('editDate', { schedule });
});

// ✅ Update a specific date (safe against crashes)
router.post('/edit/:date', async (req, res) => {
  const { periods = [], isHoliday, holidayReason } = req.body;

  const cleanPeriods = Array.isArray(periods) ? periods.map(p => ({
    periodNo: parseInt(p.periodNo),
    subject: p.subject,
    startTime: p.startTime,
    endTime: p.endTime,
    active: p.active === 'on',
    isLab: p.isLab === 'on'
  })) : [];

  const totalTime = cleanPeriods.reduce((acc, p) => {
    const [sh, sm] = p.startTime.split(":").map(Number);
    const [eh, em] = p.endTime.split(":").map(Number);
    return acc + ((eh * 60 + em) - (sh * 60 + sm));
  }, 0);

  await Schedule.updateOne(
    { date: req.params.date },
    {
      periods: cleanPeriods,
      totalClasses: cleanPeriods.length,
      totalTime,
      isHoliday: isHoliday === 'on',
      holidayReason: isHoliday === 'on' ? holidayReason : ''
    }
  );

  res.redirect('/admin');
});

// ➕ GET: Form to create new day schedule
router.get('/new', (req, res) => {
  res.render('newDate');
});

// ✅ POST: Save new day schedule (safe and clean)
router.post('/new', async (req, res) => {
  const { date, dayName, periods = [] } = req.body;

  const cleanPeriods = Array.isArray(periods) ? periods.map(p => ({
    periodNo: parseInt(p.periodNo),
    subject: p.subject,
    startTime: p.startTime,
    endTime: p.endTime,
    active: p.active === 'on',
    isLab: p.isLab === 'on'
  })) : [];

  const totalTime = cleanPeriods.reduce((acc, p) => {
    const [sh, sm] = p.startTime.split(":").map(Number);
    const [eh, em] = p.endTime.split(":").map(Number);
    return acc + ((eh * 60 + em) - (sh * 60 + sm));
  }, 0);

  await Schedule.create({
    date,
    dayName,
    periods: cleanPeriods,
    totalClasses: cleanPeriods.length,
    totalTime
  });

  res.redirect('/admin');
});

// 📅 Calendar view for marking holidays
router.get('/calendar', async (req, res) => {
  const schedules = await Schedule.find({}).sort({ date: 1 });
  res.render('calendar', { schedules });
});

// ✅ Toggle holiday status via calendar UI
router.post('/calendar/toggle', async (req, res) => {
  const { date, isHoliday, holidayReason } = req.body;

  await Schedule.updateOne(
    { date },
    {
      isHoliday: isHoliday === 'true',
      holidayReason: isHoliday === 'true' ? holidayReason : '',
    }
  );

  res.json({ success: true });
});

module.exports = router;
