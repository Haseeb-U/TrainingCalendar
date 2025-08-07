const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwtTokenDecoder = require('../../middleware/jwtTokenDecoder');
const { sendTrainingDataShareEmail } = require('../../mail/email');
const { format } = require('@fast-csv/format');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

router.post(
  '/shareTrainingData',
  [
    jwtTokenDecoder,
    [
      check('email', 'Valid recipient email required').isEmail(),
      check('startDate', 'Valid start date required (e.g. 13/Jul/2022)').matches(/^\d{2}\/[A-Za-z]{3}\/\d{4}$/),
      check('endDate', 'Valid end date required (e.g. 20/Jul/2022)').matches(/^\d{2}\/[A-Za-z]{3}\/\d{4}$/),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = req.user.id;
    const { email, startDate, endDate } = req.body;

    // Helper to parse DD/MMM/YYYY to YYYY-MM-DD
    function parseDate(str) {
      const months = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
      };
      const [day, mon, year] = str.split('/');
      return `${year}-${months[mon]}-${day}`;
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
        SELECT id, name, duration, number_of_participants, schedule_date, venue, status, training_hours
        FROM Trainings
        WHERE user_id = ? AND DATE(schedule_date) BETWEEN ? AND ?
      `;
      const [trainings] = await req.app.locals.db.query(
        sql,
        [userId, parseDate(startDate), parseDate(endDate)]
      );
      if (!trainings.length) return res.status(404).json({ msg: 'No trainings found in date range' });

      // Convert to CSV with custom column names
      let csv = '';
      const csvStream = format({ 
        headers: ['Name', 'Duration', 'Total_Participants', 'Scheduled_Date', 'Venue', 'Status', 'Training_Hours']
      });
      csvStream.on('data', chunk => { csv += chunk.toString(); });
      
      // Map database fields to custom column structure
      trainings.forEach(row => {
        // Format the schedule_date to the desired format
        const scheduleDate = new Date(row.schedule_date);
        const options = { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: '2-digit' 
        };
        const datePart = scheduleDate.toLocaleDateString('en-US', options);
        const hours = scheduleDate.getHours();
        const minutes = scheduleDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedDateTime = `${datePart} ${formattedHours}:${formattedMinutes}${ampm}`;

        csvStream.write([
          row.name,
          row.duration,
          row.number_of_participants,
          formattedDateTime, // Use formatted date instead of raw schedule_date
          row.venue,
          row.status,
          row.training_hours
        ]);
      });
      csvStream.end();

      await new Promise(resolve => csvStream.on('end', resolve));

      // Get all training IDs for file lookup
      const trainingIds = trainings.map(training => training.id);
      
      // Fetch files related to these trainings from the database
      let trainingFiles = [];
      if (trainingIds.length > 0) {
        const placeholders = trainingIds.map(() => '?').join(',');
        const [files] = await req.app.locals.db.query(
          `SELECT uf.*, t.name as training_name 
           FROM user_files uf 
           JOIN trainings t ON uf.training_id = t.id 
           WHERE uf.training_id IN (${placeholders}) 
           AND uf.user_id = ?`,
          [...trainingIds, userId]
        );
        
        // Map the database files to our expected format
        trainingFiles = files.map(file => ({
          filename: file.file_path,
          original_name: file.file_path,
          training_id: file.training_id,
          training_name: file.training_name,
          file_path: path.join(__dirname, '../../userFiles', file.file_path)
        }));
      }

      // Create zip file with training files
      let zipBuffer = null;
      const zipFileName = `Training_Files_${userInfo.name.replace(/\s+/g, '_')}_${startDate.replace(/\//g, '-')}_to_${endDate.replace(/\//g, '-')}.zip`;
      
      if (trainingFiles.length > 0) {
        zipBuffer = await createTrainingFilesZip(trainingFiles, userInfo.name);
      }

      // Prepare enhanced email content and send
      const fileName = `Training_Report_${userInfo.name.replace(/\s+/g, '_')}_${startDate.replace(/\//g, '-')}_to_${endDate.replace(/\//g, '-')}.csv`;
      
      const reportData = {
        userName: userInfo.name,
        userEmail: userInfo.email,
        startDate,
        endDate,
        totalTrainings: trainings.length,
        trainings: trainings,
        fileName,
        totalFiles: trainingFiles.length,
        hasFiles: trainingFiles.length > 0
      };

      // Prepare attachments array
      const attachments = [
        {
          filename: fileName,
          content: csv,
        }
      ];

      // Add zip file if there are training files
      if (zipBuffer) {
        attachments.push({
          filename: zipFileName,
          content: zipBuffer,
        });
      }

      await sendTrainingDataShareEmail(email, reportData, attachments);

      res.json({ msg: 'Training data sent successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Helper function to create zip file with training files
async function createTrainingFilesZip(trainingFiles, userName) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    const chunks = [];
    
    archive.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    archive.on('end', () => {
      const zipBuffer = Buffer.concat(chunks);
      resolve(zipBuffer);
    });
    
    archive.on('error', (err) => {
      reject(err);
    });

    // Group files by training
    const filesByTraining = {};
    trainingFiles.forEach(file => {
      const trainingName = file.training_name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      if (!filesByTraining[trainingName]) {
        filesByTraining[trainingName] = [];
      }
      filesByTraining[trainingName].push(file);
    });

    // Add files to zip organized by training folders
    Object.keys(filesByTraining).forEach(trainingName => {
      filesByTraining[trainingName].forEach(file => {
        // Check if file exists before adding to zip
        if (fs.existsSync(file.file_path)) {
          const originalName = file.original_name || file.filename;
          archive.file(file.file_path, { 
            name: `${trainingName}/${originalName}` 
          });
        }
      });
    });

    // Add a readme file explaining the contents
    const readmeContent = `Training Files Archive
Generated on: ${new Date().toLocaleString()}
User: ${userName}

This archive contains all files related to your training sessions within the specified date range.
Files are organized by training name in separate folders.

Training Sessions Included:
${Object.keys(filesByTraining).map(training => `- ${training.replace(/_/g, ' ')}`).join('\n')}

Total Files: ${trainingFiles.length}
`;
    
    archive.append(readmeContent, { name: 'README.txt' });
    
    archive.finalize();
  });
}

module.exports = router;