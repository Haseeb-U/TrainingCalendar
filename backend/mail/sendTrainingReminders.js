const { initDatabase } = require('../DB/mysql');
const { sendTrainingNotification } = require('./email');
const { formatDateConsistent } = require('../utils/dateFormatter');

async function sendReminders() {
  console.log('=== REMINDER FUNCTION STARTED ===');
  const db = await initDatabase();
  
  // Get trainings scheduled within next 2 days and not completed
  const [trainings] = await db.query(
    `SELECT id, name, schedule_date, notification_recipients 
     FROM trainings 
     WHERE status = 'pending' 
       AND schedule_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 2 DAY)`
  );

  console.log(`Found ${trainings.length} trainings:`, trainings);

  for (const training of trainings) {
    let recipients = [];
    
    // Handle both cases: JSON string or already parsed array
    if (Array.isArray(training.notification_recipients)) {
      // Already parsed by MySQL
      recipients = training.notification_recipients;
      console.log(`Training ${training.id} recipients (already parsed):`, recipients);
    } else if (typeof training.notification_recipients === 'string') {
      // JSON string that needs parsing
      try {
        recipients = JSON.parse(training.notification_recipients);
        console.log(`Training ${training.id} recipients (parsed):`, recipients);
      } catch (err) {
        console.log(`Training ${training.id} - JSON parse error:`, err.message);
        continue;
      }
    }
    
    if (!Array.isArray(recipients) || recipients.length === 0) {
      console.log(`Training ${training.id} - No valid recipients`);
      continue;
    }

    const subject = `Upcoming Training: ${training.name}`;
    const formattedDate = formatDateConsistent(training.schedule_date);
    const text = `Reminder: The training "${training.name}" is scheduled on ${formattedDate}.`;

    try {
      await sendTrainingNotification(recipients.join(','), subject, text);
      console.log(`✅ Sent reminder for training ${training.id}`);
    } catch (err) {
      console.log(`❌ Failed to send reminder for training ${training.id}:`, err.message);
    }
  }
  console.log('=== REMINDER FUNCTION COMPLETED ===');
}

module.exports = { sendReminders };