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

  try {
    await req.app.locals.db.query(
      'INSERT INTO user_files (user_id, file_path) VALUES (?, ?)',
      [userId, fileName] // Save filename, not full path
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


// route to fetch all files for a user
// @route   GET /api/files/my-files
// access  private
router.get('/my-files', jwtTokenDecoder, async (req, res) => {
  const userId = req.user.id;

  try {
    const [files] = await req.app.locals.db.query(
      'SELECT * FROM user_files WHERE user_id = ?',
      [userId]
    );
    res.status(200).json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
