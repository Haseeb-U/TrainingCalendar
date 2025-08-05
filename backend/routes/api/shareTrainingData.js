const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwtTokenDecoder = require('../../middleware/jwtTokenDecoder');
const { sendTrainingNotification } = require('../../mail/email');
const { format } = require('@fast-csv/format');

router.post(
  '/shareTrainingData',
  [
    jwtTokenDecoder,
    [
      check('email', 'Valid recipient email required').isEmail(),
      check('startDate', 'Valid start date required (e.g. 1/Jan/2025)').matches(/^\d{1,2}\/[A-Za-z]{3}\/\d{4}$/),
      check('endDate', 'Valid end date required (e.g. 1/Jan/2025)').matches(/^\d{1,2}\/[A-Za-z]{3}\/\d{4}$/),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = req.user.id;
    const { email, startDate, endDate } = req.body;

    // Helper to parse d/MMM/yyyy to YYYY-MM-DD
    function parseDate(str) {
      const months = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
      };
      const [day, mon, year] = str.split('/');
      const paddedDay = day.padStart(2, '0'); // Pad single digit days
      return `${year}-${months[mon]}-${paddedDay}`;
    }

    try {
      // Fetch user info
      const [userRows] = await req.app.locals.db.query(
        'SELECT name, email FROM Users WHERE id = ?',
        [userId]
      );
      if (!userRows.length) return res.status(404).json({ msg: 'User not found' });
      const userInfo = userRows[0];

      // Fetch trainings in date range
      const sql = `
        SELECT name, duration, number_of_participants, schedule_date, venue, status, training_hours
        FROM Trainings
        WHERE user_id = ? AND schedule_date BETWEEN ? AND ?
      `;
      const [trainings] = await req.app.locals.db.query(
        sql,
        [userId, parseDate(startDate), parseDate(endDate)]
      );
      if (!trainings.length) return res.status(404).json({ msg: 'No trainings found in date range' });

      // Convert to CSV
      let csv = '';
      const csvStream = format({ headers: true });
      csvStream.on('data', chunk => { csv += chunk.toString(); });
      trainings.forEach(row => csvStream.write(row));
      csvStream.end();

      await new Promise(resolve => csvStream.on('end', resolve));

      // Prepare email body
      const userInfoText = `
User Info:
Name: ${userInfo.name}
Email: ${userInfo.email}
      `;
      const trainingSummary = `Total Trainings: ${trainings.length}`;
      const emailBody = `
${userInfoText}

${trainingSummary}

Trainings from ${startDate} to ${endDate}

Please find attached your training data as CSV.
      `;

      // Send email with CSV attachment
      await sendTrainingNotification(
        email,
        'Shared Training Data',
        emailBody,
        {
          filename: `trainings by ${userInfo.name}.csv`,
          content: csv,
        }
      );

      res.json({ msg: 'Training data sent successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;