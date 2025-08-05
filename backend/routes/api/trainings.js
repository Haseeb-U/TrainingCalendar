const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
// require('dotenv').config();
const jwtTokenDecoder = require('../../middleware/jwtTokenDecoder');
const { sendTrainingNotification } = require('../../mail/email');
const { formatDateConsistent } = require('../../utils/dateFormatter');


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
            check('schedule_date', 'Schedule date is required').not().isEmpty(),
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
            const training = {
                name,
                duration,
                number_of_participants,
                schedule_date,
                venue,
                training_hours,
                notification_recipients,
                status,
                user_id: userId,
            };

            const [result] = await req.app.locals.db.query(
                'INSERT INTO Trainings SET ?',
                training
            );

            res.status(201).json({
                msg: 'Training created successfully',
                training_id: result.insertId,
            });

            // Send immediate reminder if training is within 2 days
            const scheduleDate = new Date(schedule_date);
            const today = new Date();
            const twoDaysFromNow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
            
            if (scheduleDate >= today && scheduleDate <= twoDaysFromNow && status === 'pending') {
                try {
                    // Parse notification recipients
                    let recipients = [];
                    if (Array.isArray(notification_recipients)) {
                        recipients = notification_recipients;
                    } else if (typeof notification_recipients === 'string') {
                        try {
                            recipients = JSON.parse(notification_recipients);
                        } catch (parseError) {
                            console.error('Error parsing notification recipients:', parseError);
                            recipients = [];
                        }
                    }

                    if (Array.isArray(recipients) && recipients.length > 0) {
                        const formattedDate = formatDateConsistent(schedule_date);
                        
                        const subject = `Upcoming Training: ${name}`;
                        const text = `Reminder: The training "${name}" is scheduled on ${formattedDate}.`;
                        
                        await sendTrainingNotification(recipients.join(','), subject, text);
                        console.log(`Sent immediate reminder for new training: ${name}`);
                    } else {
                        console.log('No valid recipients found for training notification');
                    }
                } catch (error) {
                    console.error('Error sending immediate reminder:', error);
                }
            }
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
        check('schedule_date', 'Schedule date is required').not().isEmpty(),
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
            const training = {
                name,
                duration,
                number_of_participants,
                schedule_date,
                venue,
                training_hours,
                notification_recipients,
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

            // Send immediate reminder if training is within 2 days
            const scheduleDate = new Date(schedule_date);
            const today = new Date();
            const twoDaysFromNow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
            
            if (scheduleDate >= today && scheduleDate <= twoDaysFromNow && status === 'pending') {
                try {
                    // Parse notification recipients
                    let recipients = [];
                    if (Array.isArray(notification_recipients)) {
                        recipients = notification_recipients;
                    } else if (typeof notification_recipients === 'string') {
                        try {
                            recipients = JSON.parse(notification_recipients);
                        } catch (parseError) {
                            console.error('Error parsing notification recipients:', parseError);
                            recipients = [];
                        }
                    }

                    if (Array.isArray(recipients) && recipients.length > 0) {
                        const formattedDate = formatDateConsistent(schedule_date);
                        
                        const subject = `Updated Training: ${name}`;
                        const text = `Reminder: The training "${name}" has been updated and is scheduled on ${formattedDate}.`;
                        
                        await sendTrainingNotification(recipients.join(','), subject, text);
                        console.log(`Sent immediate reminder for updated training: ${name}`);
                    } else {
                        console.log('No valid recipients found for training notification');
                    }
                } catch (error) {
                    console.error('Error sending immediate reminder:', error);
                }
            }
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

        res.status(200).json(trainings);
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

module.exports = router;