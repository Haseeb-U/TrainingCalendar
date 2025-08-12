const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
// require('dotenv').config();
const jwtTokenDecoder = require('../../middleware/jwtTokenDecoder');
const { sendNewTrainingNotificationEmail } = require('../../mail/email');


// route to handle training creation requests
// POST /api/trainings
// access private
router.post(
	'/create',
	[
		jwtTokenDecoder,
		[
            check('name', 'Name is required').not().isEmpty(),
            check('duration', 'Duration is required').not().isEmpty(),
            check('number_of_participants', 'Number of participants is required').not().isEmpty(),
            check('schedule_date', 'Schedule date is required').not().isEmpty()
                .custom((value) => {
                    const date = new Date(value);
                    if (isNaN(date.getTime())) {
                        throw new Error('Invalid datetime format. Expected format: YYYY-MM-DD HH:MM:SS or ISO string');
                    }
                    return true;
                }),
            check('venue', 'Venue is required').not().isEmpty(),
            check('training_hours', 'Training hours are required').not().isEmpty(),
            check('notification_recipients', 'Notification recipients are required').not().isEmpty(),
            check('status', 'Status is required').isIn(['pending', 'completed']),

		],
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

        const userId = req.user.id;
        const {
            name,
            duration,
            number_of_participants,
            schedule_date,
            venue,
            training_hours,
            notification_recipients,
            status,
        } = req.body;


        try {
            // Get user's email address
            const [userResult] = await req.app.locals.db.query(
                'SELECT email FROM users WHERE id = ?',
                [userId]
            );

            if (userResult.length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const userEmail = userResult[0].email;

            // Parse notification recipients
            let recipients = [];
            if (typeof notification_recipients === 'string') {
                try {
                    recipients = JSON.parse(notification_recipients);
                } catch {
                    recipients = notification_recipients.split(',').map(email => email.trim());
                }
            } else if (Array.isArray(notification_recipients)) {
                recipients = notification_recipients;
            }

            // Add user's email if not already included
            if (!recipients.includes(userEmail)) {
                recipients.push(userEmail);
            }

            // Format datetime to MySQL DATETIME format without timezone conversion
            let formattedDateTime;
            if (schedule_date.includes('T')) {
                // If it's an ISO string, convert to MySQL format
                formattedDateTime = schedule_date.slice(0, 19).replace('T', ' ');
            } else if (schedule_date.includes(' ')) {
                // If it's already in YYYY-MM-DD HH:MM:SS format, use as is
                formattedDateTime = schedule_date;
            } else {
                // Fallback: try to parse and format
                const date = new Date(schedule_date);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            }            const training = {
                name,
                duration,
                number_of_participants,
                schedule_date: formattedDateTime,
                venue,
                training_hours,
                notification_recipients: JSON.stringify(recipients),
                status,
                user_id: userId,
            };

            const [result] = await req.app.locals.db.query(
                'INSERT INTO Trainings SET ?',
                training
            );


            // Send immediate notification if training is within 2 days
            const scheduleDate = new Date(schedule_date);
            const today = new Date();
            const daysDiff = Math.ceil((scheduleDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 2 && daysDiff >= 0) {
                try {
                    if (Array.isArray(recipients) && recipients.length > 0) {
                        for (const email of recipients) {
                            if (email && email.trim()) {
                                await sendNewTrainingNotificationEmail(email.trim(), {
                                    name,
                                    schedule_date: formattedDateTime,
                                    venue,
                                    duration,
                                    training_hours,
                                    number_of_participants,
                                    status
                                });
                            }
                        }
                        console.log('✅ Beautiful immediate notifications sent for new training');
                    }
                } catch (emailError) {
                    console.error('❌ Failed to send immediate notification:', emailError);
                    // Don't fail the training creation if email fails
                }
            }

            res.status(201).json({
                msg: 'Training created successfully',
                training_id: result.insertId,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
	}
);


// route to handle Training updation requests
// PATCH /api/trainings
// access private
router.patch(
    '/update',
    [jwtTokenDecoder, [
        check('training_id', 'Training ID is required').not().isEmpty(),
        check('name', 'Name is required').not().isEmpty(),
        check('duration', 'Duration is required').not().isEmpty(),
        check('number_of_participants', 'Number of participants is required').not().isEmpty(),
        check('schedule_date', 'Schedule date is required').not().isEmpty()
            .custom((value) => {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    throw new Error('Invalid datetime format. Expected format: YYYY-MM-DD HH:MM:SS or ISO string');
                }
                return true;
            }),
        check('venue', 'Venue is required').not().isEmpty(),
        check('training_hours', 'Training hours are required').not().isEmpty(),
        check('notification_recipients', 'Notification recipients are required').not().isEmpty(),
        check('status', 'Status is required').isIn(['pending', 'completed']),
    ]],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const {
            training_id,
            name,
            duration,
            number_of_participants,
            schedule_date,
            venue,
            training_hours,
            notification_recipients,
            status,
        } = req.body;


        try {
            // Get user's email address
            const [userResult] = await req.app.locals.db.query(
                'SELECT email FROM users WHERE id = ?',
                [userId]
            );

            if (userResult.length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const userEmail = userResult[0].email;

            // Parse notification recipients
            let recipients = [];
            if (typeof notification_recipients === 'string') {
                try {
                    recipients = JSON.parse(notification_recipients);
                } catch {
                    recipients = notification_recipients.split(',').map(email => email.trim());
                }
            } else if (Array.isArray(notification_recipients)) {
                recipients = notification_recipients;
            }

            // Add user's email if not already included
            if (!recipients.includes(userEmail)) {
                recipients.push(userEmail);
            }

            // Format datetime to MySQL DATETIME format without timezone conversion
            let formattedDateTime;
            if (schedule_date.includes('T')) {
                // If it's an ISO string, convert to MySQL format
                formattedDateTime = schedule_date.slice(0, 19).replace('T', ' ');
            } else if (schedule_date.includes(' ')) {
                // If it's already in YYYY-MM-DD HH:MM:SS format, use as is
                formattedDateTime = schedule_date;
            } else {
                // Fallback: try to parse and format
                const date = new Date(schedule_date);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            }
            
            const training = {
                name,
                duration,
                number_of_participants,
                schedule_date: formattedDateTime,
                venue,
                training_hours,
                notification_recipients: JSON.stringify(recipients),
                status,
            };

            const [result] = await req.app.locals.db.query(
                'UPDATE Trainings SET ? WHERE id = ? AND user_id = ?',
                [training, training_id, userId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ msg: 'Training not found or access denied' });
            }

            res.status(200).json({
                msg: 'Training updated successfully',
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }
);


// route to handle Training deletion requests
// DELETE /api/trainings
// access private
router.delete('/:training_id', jwtTokenDecoder, async (req, res) => {
    const userId = req.user.id;
    const training_id = req.params.training_id;


    try {
        const [result] = await req.app.locals.db.query(
            'DELETE FROM Trainings WHERE id = ? AND user_id = ?',
            [training_id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Training not found or access denied' });
        }

        res.status(200).json({
            msg: 'Training deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


// route to handle my training fetch requests
// GET /api/trainings/
// access private
router.get('/my-trainings', [jwtTokenDecoder], async (req, res) => {
    const userId = req.user.id;

    try {
        const [trainings] = await req.app.locals.db.query(
            'SELECT * FROM Trainings WHERE user_id = ? ORDER BY schedule_date DESC',
            [userId]
        );

        if (!trainings || trainings.length === 0) {
            return res.status(404).json({ msg: 'No trainings found' });
        }

        // Get files for each training
        const trainingsWithFiles = await Promise.all(trainings.map(async (training) => {
            const [files] = await req.app.locals.db.query(
                'SELECT uf.id, uf.file_path, uf.uploaded_at, u.name as uploaded_by FROM user_files uf LEFT JOIN users u ON uf.user_id = u.id WHERE uf.training_id = ?',
                [training.id]
            );

            const filesWithUrls = files.map(file => ({
                ...file,
                fileUrl: `/userFiles/${file.file_path}`
            }));

            return {
                ...training,
                files: filesWithUrls,
                file_count: filesWithUrls.length
            };
        }));

        res.status(200).json(trainingsWithFiles);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }

});


// route to handle training status update requests
// PATCH /api/trainings/
router.patch('/status', [jwtTokenDecoder, [
    check('training_id', 'Training ID is required').not().isEmpty(),
    check('status', 'Status is required').isIn(['pending', 'completed']),
]], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { training_id, status } = req.body;

    try {
        // If trying to mark as complete, check if files are uploaded
        if (status === 'completed') {
            const [files] = await req.app.locals.db.query(
                'SELECT COUNT(*) as file_count FROM user_files WHERE training_id = ?',
                [training_id]
            );

            if (files[0].file_count === 0) {
                return res.status(400).json({ 
                    msg: 'Cannot mark training as completed. At least one file must be uploaded for this training.' 
                });
            }
        }

        const [result] = await req.app.locals.db.query(
            'UPDATE Trainings SET status = ? WHERE id = ? AND user_id = ?',
            [status, training_id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Training not found or access denied' });
        }

        res.status(200).json({
            msg: 'Training status updated successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// route to get a single training with its files
// GET /api/trainings/:id
// access private
router.get('/:id', jwtTokenDecoder, async (req, res) => {
    const trainingId = req.params.id;
    const userId = req.user.id;

    try {
        // Get training details
        const [training] = await req.app.locals.db.query(
            'SELECT * FROM Trainings WHERE id = ? AND user_id = ?',
            [trainingId, userId]
        );

        if (training.length === 0) {
            return res.status(404).json({ msg: 'Training not found or access denied' });
        }

        // Get associated files
        const [files] = await req.app.locals.db.query(
            'SELECT uf.id, uf.file_path, uf.uploaded_at, u.name as uploaded_by FROM user_files uf LEFT JOIN users u ON uf.user_id = u.id WHERE uf.training_id = ?',
            [trainingId]
        );

        const filesWithUrls = files.map(file => ({
            ...file,
            fileUrl: `/userFiles/${file.file_path}`
        }));

        res.status(200).json({
            ...training[0],
            files: filesWithUrls
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// route to import trainings from CSV file
// POST /api/trainings/import
// access private
router.post('/import', jwtTokenDecoder, (req, res) => {
    const multer = require('multer');
    const csv = require('csv-parser');
    const stream = require('stream');

    // Configure multer for file upload
    const storage = multer.memoryStorage();
    const upload = multer({ 
        storage: storage,
        fileFilter: (req, file, cb) => {
            if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv')) {
                cb(null, true);
            } else {
                cb(new Error('Only CSV files are allowed'), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        }
    });

    upload.single('csvFile')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ errors: [{ msg: err.message }] });
        }

        if (!req.file) {
            return res.status(400).json({ errors: [{ msg: 'No CSV file provided' }] });
        }

        const userId = req.user.id;
        
        // Get user's email for notification recipients
        let userEmail = '';
        try {
            const [userResult] = await req.app.locals.db.query(
                'SELECT email FROM users WHERE id = ?',
                [userId]
            );
            if (userResult.length > 0) {
                userEmail = userResult[0].email;
            }
        } catch (error) {
            console.error('Error fetching user email:', error);
        }

        const csvData = req.file.buffer.toString();
        const trainingsToImport = [];

        try {
            // Parse CSV data using Promise
            await new Promise((resolve, reject) => {
                const readable = new stream.Readable();
                readable.push(csvData);
                readable.push(null);

                readable
                    .pipe(csv())
                    .on('data', (row) => {
                        try {
                            // Parse the formatted date back to MySQL DATETIME format
                            const scheduledDateStr = row['Scheduled_Date'] || row['scheduled_date'] || row['Schedule_Date'] || row['date'] || row['Date & Time'] || row['Date'];
                            
                            if (!scheduledDateStr) {
                                console.warn('Missing date for row:', row);
                                return;
                            }

                            // Parse various date formats
                            let parsedDate = new Date(scheduledDateStr.replace(/(\d{1,2}):(\d{2})(AM|PM)/i, ' $1:$2 $3'));
                            
                            // If parsing failed, try other formats
                            if (isNaN(parsedDate.getTime())) {
                                parsedDate = new Date(scheduledDateStr);
                            }

                            if (isNaN(parsedDate.getTime())) {
                                console.warn('Invalid date format for row:', row);
                                return;
                            }

                            // Format to MySQL DATETIME
                            const year = parsedDate.getFullYear();
                            const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
                            const day = String(parsedDate.getDate()).padStart(2, '0');
                            const hours = String(parsedDate.getHours()).padStart(2, '0');
                            const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
                            const seconds = String(parsedDate.getSeconds()).padStart(2, '0');
                            const mysqlDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

                            const training = {
                                name: row['Name'] || row['name'] || '',
                                duration: parseInt(row['Duration'] || row['duration'] || '0') || 0,
                                number_of_participants: parseInt(row['Total_Participants'] || row['participants'] || row['Total Participants'] || row['Participants'] || '0') || 0,
                                schedule_date: mysqlDateTime,
                                venue: row['Venue'] || row['venue'] || '',
                                training_hours: parseInt(row['Training_Hours'] || row['training_hours'] || row['Training Hours'] || '0') || 0,
                                status: 'pending', // Always set as pending for imports
                                notification_recipients: JSON.stringify(userEmail ? [userEmail] : []), // Add user's email to notifications
                                user_id: userId
                            };

                            // Validate required fields
                            if (training.name && training.duration && training.venue && training.training_hours) {
                                trainingsToImport.push(training);
                            } else {
                                console.warn('Skipping invalid row:', row);
                            }
                        } catch (error) {
                            console.warn('Error processing row:', row, error);
                        }
                    })
                    .on('end', () => {
                        resolve();
                    })
                    .on('error', (csvError) => {
                        reject(csvError);
                    });
            });

            if (trainingsToImport.length === 0) {
                return res.status(400).json({ errors: [{ msg: 'No valid training data found in CSV file' }] });
            }

            // Insert trainings into database
            const insertPromises = trainingsToImport.map(training => {
                return req.app.locals.db.query(
                    `INSERT INTO Trainings 
                    (name, duration, number_of_participants, schedule_date, venue, status, training_hours, notification_recipients, user_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        training.name,
                        training.duration,
                        training.number_of_participants,
                        training.schedule_date,
                        training.venue,
                        training.status,
                        training.training_hours,
                        training.notification_recipients,
                        training.user_id
                    ]
                );
            });

            await Promise.all(insertPromises);

            res.json({ 
                msg: `Successfully imported ${trainingsToImport.length} training(s). All imported trainings are marked as pending.` 
            });

        } catch (error) {
            console.error('Import error:', error);
            if (error.message && error.message.includes('CSV')) {
                res.status(400).json({ errors: [{ msg: 'Invalid CSV format' }] });
            } else {
                res.status(500).json({ errors: [{ msg: 'Database error while importing trainings' }] });
            }
        }
    });
});

module.exports = router;