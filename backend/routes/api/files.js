const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwtTokenDecoder = require('../../middleware/jwtTokenDecoder');

// Function to sanitize filename
function sanitizeFilename(filename) {
  // Remove or replace characters that are not safe for filenames
  return filename
    .replace(/[<>:"/\\|?*]/g, '_') // Replace unsafe characters with underscore
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single underscore
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
}


// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../userFiles'));
  },
  filename: function (req, file, cb) {
    // Save with timestamp for uniqueness, userId will be handled in the route
    const ext = path.extname(file.originalname);
    cb(null, `temp_${Date.now()}${ext}`);
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
  const originalName = path.parse(req.file.originalname).name; // Get filename without extension
  const sanitizedName = sanitizeFilename(originalName); // Sanitize the filename
  const ext = path.extname(req.file.originalname);
  const now = new Date();
  const dateCreated = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const timeCreated = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // Format: HH-MM-SS
  
  // Create filename: originalname_YYYY-MM-DD_HH-MM-SS_userID.ext
  const newFilename = `${sanitizedName}_${dateCreated}_${timeCreated}_user${userId}${ext}`;
  
  // Rename the file to include the new naming convention
  const fs = require('fs');
  const oldPath = req.file.path;
  const newPath = path.join(path.dirname(oldPath), newFilename);
  
  try {
    fs.renameSync(oldPath, newPath);
  } catch (err) {
    console.error('Error renaming file:', err);
    return res.status(500).json({ msg: 'Error processing file' });
  }
  
  const fileName = newFilename; // Store the new filename
  const title = req.body.title || req.file.originalname; // Use provided title or original filename

  console.log('File upload attempt:', { 
    userId, 
    originalName: req.file.originalname,
    sanitizedName,
    newFileName: fileName, 
    title 
  });

  try {
    await req.app.locals.db.query(
      'INSERT INTO user_files (user_id, title, file_path) VALUES (?, ?, ?)',
      [userId, title, fileName] // Save filename, not full path
    );
    console.log('File saved to database successfully');
    res.status(201).json({ 
      msg: 'File uploaded successfully', 
      fileUrl: `/userFiles/${fileName}` // Provide accessible URL
    });
  } catch (err) {
    console.error('Database error:', err);
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
  console.log('Fetching files for user:', userId);

  try {
    const [files] = await req.app.locals.db.query(
      'SELECT id, title, file_path, uploaded_at FROM user_files WHERE user_id = ?',
      [userId]
    );
    
    console.log('Found files:', files.length);
    
    // Add file URL to each file object
    const filesWithUrls = files.map(file => ({
      ...file,
      fileUrl: `/userFiles/${file.file_path}`
    }));
    
    res.status(200).json(filesWithUrls);
  } catch (err) {
    console.error('Database error fetching files:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
