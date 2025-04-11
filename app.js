
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config(); 

const app = express();

const dbUrl = process.env.ATLASDB_URL; 

// MongoDB Connection
main()
.then(()=>{
  console.log("✅ DB connected");
})
.catch((err)=>{
  console.log('❌ MongoDB error:', err);
})

async function main() {
  await mongoose.connect(dbUrl);
}
// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');
const abhi = require("./routes/abhi");

app.use('/student', studentRoutes);
app.use('/admin', adminRoutes);
app.use('/abhi',abhi);

app.get('/home', (req, res) => {
  res.render('index');
});
app.get('/', (req, res) => {
  res.redirect('/home');   
});

app.get('/timetable', (req, res) => {
  const timetable = {
    "Mon": ["ML", "WAD", "", "DMS", "OS","", "DMS Lab/WAD Lab", "DMS Lab/WAD Lab", "DMS Lab/WAD Lab"],
    "Tue": ["OS", "ML", "", "WAD", "DMS", "", "", "",""],
    "Wed": ["ML", "DMS Lab/WAD Lab", "", "DMS Lab/WAD Lab", "DMS Lab/WAD Lab","", "DMS", "GS", "GS"],
    "Thu": ["DMS", "OS", "", "ML", "WAD","", "OS", "", ""],
    "Fri": ["BC Lab", "BC Lab", "", "OS", "ML", "WAD", "", "",""],
    "Sat": ["WAD", "DMS", "", "ML", "OS","", "MP", "MP", "MP"]
  };

  const periods = [
    "Period 1  09:20 AM - 10:10 AM",
    "Period 2  10:10 AM - 11:00 AM",
    "Break  11:00 AM - 11:10 AM",
    "Period 3  11:10 AM - 12:00 PM",
    "Period 4  12:00 PM - 12:50 PM",
    "Lunch  12:50 PM - 01:30 PM",
    "Period 5  01:30 PM - 02:20 PM",
    "Period 6  02:20 PM - 03:05 PM",
    "Period 7  03:05 PM - 03:50 PM"
  ];
const totalclasses = [7,4,7,5,5,7]
  res.render('timetable', { timetable, periods,totalclasses });
});

// Default
app.get('*', (req, res) => {
  res.send("404 Not Found");
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
