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
    [check('email', 'Valid recipient email required').isEmail()],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = req.user.id;
    const { email } = req.body;

    try {
      // Fetch user info
      const [userRows] = await req.app.locals.db.query(
        'SELECT name, email FROM Users WHERE id = ?',
        [userId]
      );
      if (!userRows.length) return res.status(404).json({ msg: 'User not found' });
      const userInfo = userRows[0];

      // Fetch trainings
      const [trainings] = await req.app.locals.db.query(
        'SELECT name, duration, number_of_participants, schedule_date, venue, status, training_hours FROM Trainings WHERE user_id = ?',
        [userId]
      );
      if (!trainings.length) return res.status(404).json({ msg: 'No trainings found' });

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