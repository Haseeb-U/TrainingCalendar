const { initDatabase } = require('../DB/mysql');
const { sendTrainingNotification } = require('./email');
require('dotenv').config();

async function sendReminders() {
  const db = await initDatabase();
  // Get trainings scheduled within next 2 days and not completed
  const [trainings] = await db.query(
    `SELECT id, name, schedule_date, notification_recipients 
     FROM Trainings 
     WHERE status = 'pending' 
       AND schedule_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 2 DAY)`
  );

  for (const training of trainings) {
    let recipients = [];
    try {
      recipients = JSON.parse(training.notification_recipients);
    } catch {
      continue;
    }
    if (!Array.isArray(recipients) || recipients.length === 0) continue;

    const subject = `Upcoming Training: ${training.name}`;
    const text = `Reminder: The training "${training.name}" is scheduled on ${training.schedule_date}.`;

    await sendTrainingNotification(recipients.join(','), subject, text);
    console.log(`Sent reminder for training ${training.id}`);
  }
}

if (require.main === module) {
  sendReminders().then(() => process.exit());
}

module.exports = { sendReminders };