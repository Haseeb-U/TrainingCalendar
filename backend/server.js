require('dotenv').config();
const express = require('express');
const path = require('path');
const { initDatabase } = require('./DB/mysql');
const cron = require('node-cron');
const { sendReminders } = require('./mail/sendTrainingReminders');

const app = express();
app.use(express.json());

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});


app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});


app.get('/Login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});



app.get('/main.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});



app.get('/session.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'session.html'));
});


app.get('/table.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'table.html'));
});


app.get('/profile.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});


app.use('/api/users', require('./routes/api/users'));
app.use('/api/trainings', require('./routes/api/trainings'));
app.use('/api/trainings', require('./routes/api/shareTrainingData'));
// app.use('/api/forms', require('./routes/api/forms'));
// app.use('/api/responses', require('./routes/api/responses'));

(async () => {
  const db = await initDatabase();
  app.locals.db = db;

  // Schedule to run every day at 8am
  cron.schedule('0 8 * * *', () => {
    sendReminders();
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
})();