const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwtTokenDecoder = require('../../middleware/jwtTokenDecoder');

// Sanitize filename to remove unsafe characters but preserve readability
function sanitizeFilename(filename) {
  return filename
    .replace(/[\/\\:*?"<>|]/g, '-') // Replace unsafe chars with dash
    .replace(/\s+/g, ' ') // Keep single spaces
    .trim();
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../userFiles'));
  },
  filename: function (req, file, cb) {
    const userId = req.user.id;
    const originalName = sanitizeFilename(file.originalname);
    cb(null, `user_${userId}_${Date.now()}_${originalName}`);
  }
});
const upload = multer({ storage });

// Upload file route
router.post('/upload', jwtTokenDecoder, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  const userId = req.user.id;
  const trainingId = req.body.training_id;

  if (!trainingId) {
    return res.status(400).json({ msg: 'Training ID is required' });
  }

  try {
    // Get training details and user name
    const [training] = await req.app.locals.db.query(
      'SELECT t.id, t.name, t.schedule_date, u.name as user_name FROM Trainings t JOIN users u ON u.id = ? WHERE t.id = ?',
      [userId, trainingId]
    );

    if (training.length === 0) {
      return res.status(404).json({ msg: 'Training not found' });
    }

    // Format the training date
    const scheduleDate = new Date(training[0].schedule_date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = scheduleDate.getDate();
    const month = months[scheduleDate.getMonth()];
    const year = scheduleDate.getFullYear();
    const hours = scheduleDate.getHours();
    const minutes = scheduleDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedDateTime = `${day}-${month}-${year} ${formattedHours}.${formattedMinutes}${ampm}`;

    // Get file extension
    const fileExtension = path.extname(req.file.originalname);
    
    // Create new filename in format: [training title] by [user] [scheduled training date time]
    const newFileName = sanitizeFilename(`${training[0].name} by ${training[0].user_name} ${formattedDateTime}${fileExtension}`);
    
    // Rename the file
    const oldPath = req.file.path;
    const newPath = path.join(path.dirname(oldPath), newFileName);
    
    fs.renameSync(oldPath, newPath);

    await req.app.locals.db.query(
      'INSERT INTO user_files (user_id, training_id, file_path) VALUES (?, ?, ?)',
      [userId, trainingId, newFileName]
    );
    res.status(201).json({
      msg: 'File uploaded successfully',
      fileUrl: `/userFiles/${newFileName}`,
      training_id: trainingId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete file route
router.delete('/delete/:fileId', jwtTokenDecoder, async (req, res) => {
  const userId = req.user.id;
  const fileId = req.params.fileId;

  try {
    const [file] = await req.app.locals.db.query(
      'SELECT file_path, training_id FROM user_files WHERE id = ? AND user_id = ?',
      [fileId, userId]
    );

    if (file.length === 0) {
      return res.status(404).json({ msg: 'File not found' });
    }

    const filePath = path.join(__dirname, '../../userFiles', file[0].file_path);
    const trainingId = file[0].training_id;

    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Error deleting file' });
      }

      // Delete the file record from database
      await req.app.locals.db.query(
        'DELETE FROM user_files WHERE id = ? AND user_id = ?',
        [fileId, userId]
      );

      // Update the related training status to pending
      await req.app.locals.db.query(
        'UPDATE Trainings SET status = ? WHERE id = ? AND user_id = ?',
        ['pending', trainingId, userId]
      );

      res.status(200).json({ msg: 'File deleted successfully and training status updated to pending' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all files for user route
router.get('/my-files', jwtTokenDecoder, async (req, res) => {
  const userId = req.user.id;

  try {
    const [files] = await req.app.locals.db.query(
      'SELECT uf.id, uf.file_path, uf.uploaded_at, uf.training_id, t.name as training_name FROM user_files uf LEFT JOIN Trainings t ON uf.training_id = t.id WHERE uf.user_id = ?',
      [userId]
    );

    const filesWithUrls = files.map(file => ({
      ...file,
      fileUrl: `/userFiles/${file.file_path}`
    }));

    res.status(200).json(filesWithUrls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all files for a specific training
router.get('/training/:trainingId', jwtTokenDecoder, async (req, res) => {
  const trainingId = req.params.trainingId;

  try {
    // Verify training exists
    const [training] = await req.app.locals.db.query(
      'SELECT id, name FROM Trainings WHERE id = ?',
      [trainingId]
    );

    if (training.length === 0) {
      return res.status(404).json({ msg: 'Training not found' });
    }

    const [files] = await req.app.locals.db.query(
      'SELECT uf.id, uf.file_path, uf.uploaded_at, uf.user_id, u.name as uploaded_by FROM user_files uf LEFT JOIN users u ON uf.user_id = u.id WHERE uf.training_id = ?',
      [trainingId]
    );

    const filesWithUrls = files.map(file => ({
      ...file,
      fileUrl: `/userFiles/${file.file_path}`,
      training_name: training[0].name
    }));

    res.status(200).json({
      training: training[0],
      files: filesWithUrls
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
