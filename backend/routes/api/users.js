const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtTokenDecoder = require('../../middleware/jwtTokenDecoder');

// route to handle user register requests
// POST /api/users
// access public
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('employee_no', 'Employee number is required').isInt(),
        check('password', 'Password must be at least 8 characters').isLength({
            min: 8,
        }),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, employee_no, password } = req.body;

        try {
            const [userExists] = await req.app.locals.db.query(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (userExists.length > 0) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'User already exists' }] });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await req.app.locals.db.query(
                'INSERT INTO users (name, email, employee_no, password) VALUES (?, ?, ?, ?)',
                [name, email, employee_no, hashedPassword]
            );

            res.status(201).json({
                msg: 'User registered successfully',
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }
);


// route to handle user login requests
// POST /api/users/login
// access public
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please include a Password').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const [userExists] = await req.app.locals.db.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (userExists.length === 0) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const user = userExists[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '1h' },
                (err, token) => {
                    if (err) {
                        res.status(500).send('Server error');
                        throw err;
                    }
                    res.status(200).json({
                        token,
                        user: { name: user.name },
                    });
                }
            );
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }
);


// route to handle user change password requests
// PATCH /api/users
// access private
router.patch(
	'/change-password',
	[
		jwtTokenDecoder,
		[
			check('password', 'Password is required').exists(),
			check(
				'newPassword',
				'New Password must be at least 8 characters'
			).isLength({
				min: 8,
			}),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const userId = req.user.id;
		const { password, newPassword } = req.body;

        try {
            const [userExists] = await req.app.locals.db.query(
                'SELECT * FROM users WHERE id = ?',
                [userId]
            );

            if (userExists.length === 0) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const user = userExists[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);

            await req.app.locals.db.query(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedNewPassword, userId]
            );

            res.status(200).json({
                msg: 'Password changed successfully',
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }

	}
);


// route to handle user profile requests
// GET /api/users/profile
// access private
router.get(
    '/profile',
    jwtTokenDecoder,
    async (req, res) => {
        const userId = req.user.id;

        try {
            const [user] = await req.app.locals.db.query(
                'SELECT id, name, email, employee_no FROM users WHERE id = ?',
                [userId]
            );

            if (user.length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }

            res.status(200).json(user[0]);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }
);


module.exports = router;
