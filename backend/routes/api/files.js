const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwtTokenDecoder = require('../../middleware/jwtTokenDecoder');


// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../userFiles'));
  },
  filename: function (req, file, cb) {
    // Save with userId and timestamp for uniqueness
    const userId = req.user.id;
    const ext = path.extname(file.originalname);
    cb(null, `user_${userId}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });


// route to handle file upload
// @route   POST /api/files/upload
// access  private
router.post('/upload', jwtTokenDecoder, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }
  const userId = req.user.id;
  const fileName = req.file.filename; // Store only the filename
  const title = req.body.title || req.file.originalname; // Use provided title or original filename

  try {
    await req.app.locals.db.query(
      'INSERT INTO user_files (user_id, title, file_path) VALUES (?, ?, ?)',
      [userId, title, fileName] // Save filename, not full path
    );
    res.status(201).json({ 
      msg: 'File uploaded successfully', 
      fileUrl: `/userFiles/${fileName}` // Provide accessible URL
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// route to delete a file
// @route   DELETE /api/files/delete/:fileId
// access  private
router.delete('/delete/:fileId', jwtTokenDecoder, async (req, res) => {
  const userId = req.user.id;
  const fileId = req.params.fileId;

  try {
    // Fetch the file path from the database
    const [file] = await req.app.locals.db.query(
      'SELECT file_path FROM user_files WHERE id = ? AND user_id = ?',
      [fileId, userId]
    );

    if (file.length === 0) {
      return res.status(404).json({ msg: 'File not found' });
    }

    const filePath = path.join(__dirname, '../../userFiles', file[0].file_path);

    // Delete the file from the filesystem
    require('fs').unlink(filePath, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Error deleting file' });
      }

      // Remove the file record from the database
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


// route to fetch all files for a user
// @route   GET /api/files/my-files
// access  private
router.get('/my-files', jwtTokenDecoder, async (req, res) => {
  const userId = req.user.id;

  try {
    const [files] = await req.app.locals.db.query(
      'SELECT id, title, file_path, uploaded_at FROM user_files WHERE user_id = ?',
      [userId]
    );
    
    // Add file URL to each file object
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
