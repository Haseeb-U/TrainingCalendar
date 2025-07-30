const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
// require('dotenv').config();
const jwtTokenDecoder = require('../../middleware/jwtTokenDecoder');


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