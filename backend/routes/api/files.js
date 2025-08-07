const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwtTokenDecoder = require('../../middleware/jwtTokenDecoder');

// Sanitize filename to remove spaces and unsafe characters
function sanitizeFilename(filename) {
  return filename.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\.-]/g, '');
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
  const fileName = req.file.filename;
  // Ensure title fallback to sanitized original filename if missing
  const title = req.body.title?.trim() || req.file.originalname || fileName;

  try {
    await req.app.locals.db.query(
      'INSERT INTO user_files (user_id, title, file_path) VALUES (?, ?, ?)',
      [userId, title, fileName]
    );
    res.status(201).json({
      msg: 'File uploaded successfully',
      fileUrl: `/userFiles/${fileName}`
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
      'SELECT file_path FROM user_files WHERE id = ? AND user_id = ?',
      [fileId, userId]
    );

    if (file.length === 0) {
      return res.status(404).json({ msg: 'File not found' });
    }

    const filePath = path.join(__dirname, '../../userFiles', file[0].file_path);

    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Error deleting file' });
      }

      await req.app.locals.db.query(
        'DELETE FROM user_files WHERE id = ? AND user_id = ?',
        [fileId, userId]
      );

      res.status(200).json({ msg: 'File deleted successfully' });
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
      'SELECT id, title, file_path, uploaded_at FROM user_files WHERE user_id = ?',
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

module.exports = router;
