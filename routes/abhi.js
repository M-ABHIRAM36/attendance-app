const express = require('express');
const router = express.Router();
const Schedule = require('../models/schedule');

// GET form after login
router.get('/form', (req, res) => {
  const { email } = req.query;
  res.render('resultFwithB', { email });
});

router.post('/abhicode', async (req, res) => {
  const { email, totalClasses, attendedClasses, requiredPercentage } = req.body;

  const total = parseInt(totalClasses);
  const attended = parseInt(attendedClasses);
  const required = parseInt(requiredPercentage);

  // 🔥 Pull all schedules and compute total classes from active periods
  const allSchedules = await Schedule.find({}).sort({ date: 1 });

  function calculateEffectiveClassCount(periods) {
    return periods.reduce((acc, p) => {
      if (!p.active) return acc;
      const subject = p.subject.toLowerCase();

      if (p.isLab) return acc + 3;
      if (subject.includes("minor project")) return acc + 3;
      if (subject.includes("bc lab")) return acc + 2;
      if (subject.includes("mc")) return acc + 2;

      return acc + 1;
    }, 0);
  }

  // ✅ Use user-entered total
  const currentPercentage = (attended / total) * 100;
  let message = '';
  let extraClassesNeeded = 0;
  let days = 0, weeks = 0, months = 0;

  if (currentPercentage >= required) {
    message = `✅ You're safe! Your current attendance is ${currentPercentage.toFixed(2)}%.`;
  } else {
    // 📈 Figure out how many more classes needed to hit required %
    let needed = 0;
    while ((((attended + needed) / (total + needed)) * 100) < required) {
      needed++;
    }

    extraClassesNeeded = needed;


    // 🔥 Calculate actual number of days needed based on real upcoming schedule
    let neededClassCount = extraClassesNeeded;
    let neededDays = 0;
    for (let s of allSchedules) {
      const count = calculateEffectiveClassCount(s.periods);
      if (count === 0) continue; // Skip days with no active classes

      neededClassCount -= count;
      neededDays++;

      if (neededClassCount <= 0) break; // Done
    }

    days = neededDays;
    weeks = (days / 6).toFixed(2);
    months = (days/30).toFixed(2);
    message = `⚠️ You need to attend ${extraClassesNeeded} more classes to reach ${required}% attendance.`;
  }

  res.render('resultwithB', {
    email,
    total,
    attended,
    required,
    currentPercentage: currentPercentage.toFixed(2),
    message,
    extraClassesNeeded,
    days,
    weeks,
    months,
    schedules: allSchedules
  });


});

// ✅ Week string like "2025-W14"
function getWeekYearKey(date) {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const millisecsInDay = 86400000;
  const weekNo = Math.ceil((((date - oneJan) / millisecsInDay) + oneJan.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${weekNo}`;
}


module.exports = router;
