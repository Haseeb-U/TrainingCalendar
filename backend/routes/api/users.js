const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtTokenDecoder = require('../../middleware/jwtTokenDecoder');
const { sendWelcomeEmail, sendOTPVerificationEmail } = require('../../mail/email');
const { generateOTP, generateOTPExpiry, isOTPExpired } = require('../../utils/otpGenerator');

// Temporary storage for pending registrations (in production, use Redis or database)
const pendingRegistrations = new Map();

// route to handle user register requests (sends OTP for verification)
// POST /api/users/register
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
            // Check if user already exists
            const [userExists] = await req.app.locals.db.query(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (userExists.length > 0) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'User already exists' }] });
            }

            // Check if employee_no already exists
            const [employeeExists] = await req.app.locals.db.query(
                'SELECT id FROM users WHERE employee_no = ?',
                [employee_no]
            );

            if (employeeExists.length > 0) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Employee ID already exists' }] });
            }

            // Generate OTP
            const otp = generateOTP();
            const otpExpiry = generateOTPExpiry();

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Store pending registration data temporarily
            pendingRegistrations.set(email, {
                name,
                email,
                employee_no,
                password: hashedPassword,
                otp,
                otpExpiry,
                attempts: 0
            });

            // Send OTP verification email
            try {
                await sendOTPVerificationEmail({
                    name,
                    email,
                    otp
                });
                console.log(`✅ OTP verification email sent to ${email}`);
            } catch (emailError) {
                console.error('❌ Failed to send OTP email:', emailError);
                // Remove from pending registrations if email fails
                pendingRegistrations.delete(email);
                return res.status(500).json({ 
                    errors: [{ msg: 'Failed to send verification email. Please try again.' }] 
                });
            }

            res.status(200).json({
                msg: 'Verification code sent to your email. Please check your inbox.',
                email: email
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }
);

// route to verify OTP and complete registration
// POST /api/users/verify-otp
// access public
router.post(
    '/verify-otp',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('otp', 'OTP is required and must be 6 digits').isLength({ min: 6, max: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, otp } = req.body;

        try {
            // Get pending registration data
            const pendingData = pendingRegistrations.get(email);

            if (!pendingData) {
                return res.status(400).json({ 
                    errors: [{ msg: 'No pending registration found. Please register again.' }] 
                });
            }

            // Check if OTP has expired
            if (isOTPExpired(pendingData.otpExpiry)) {
                pendingRegistrations.delete(email);
                return res.status(400).json({ 
                    errors: [{ msg: 'OTP has expired. Please register again.' }] 
                });
            }

            // Check OTP attempts (max 3 attempts)
            if (pendingData.attempts >= 3) {
                pendingRegistrations.delete(email);
                return res.status(400).json({ 
                    errors: [{ msg: 'Too many failed attempts. Please register again.' }] 
                });
            }

            // Verify OTP
            if (pendingData.otp !== otp) {
                pendingData.attempts += 1;
                return res.status(400).json({ 
                    errors: [{ msg: `Invalid OTP. ${3 - pendingData.attempts} attempts remaining.` }] 
                });
            }

            // OTP is valid, create user in database
            const { name, employee_no, password } = pendingData;

            const [result] = await req.app.locals.db.query(
                'INSERT INTO users (name, email, employee_no, password, is_verified) VALUES (?, ?, ?, ?, ?)',
                [name, email, employee_no, password, true]
            );

            // Remove from pending registrations
            pendingRegistrations.delete(email);

            // Send welcome email
            try {
                await sendWelcomeEmail({
                    name,
                    email,
                    employee_no
                });
                console.log(`✅ Welcome email sent to ${email}`);
            } catch (emailError) {
                console.error('❌ Failed to send welcome email:', emailError);
                // Don't fail registration if email fails
            }

            res.status(201).json({
                msg: 'Email verified successfully! Your account has been created.',
                verified: true
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }
);

// route to resend OTP
// POST /api/users/resend-otp
// access public
router.post(
    '/resend-otp',
    [
        check('email', 'Please include a valid email').isEmail(),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        try {
            // Get pending registration data
            const pendingData = pendingRegistrations.get(email);

            if (!pendingData) {
                return res.status(400).json({ 
                    errors: [{ msg: 'No pending registration found. Please register again.' }] 
                });
            }

            // Generate new OTP
            const newOTP = generateOTP();
            const newOTPExpiry = generateOTPExpiry();

            // Update pending data
            pendingData.otp = newOTP;
            pendingData.otpExpiry = newOTPExpiry;
            pendingData.attempts = 0; // Reset attempts

            // Send new OTP
            try {
                await sendOTPVerificationEmail({
                    name: pendingData.name,
                    email,
                    otp: newOTP
                });
                console.log(`✅ New OTP sent to ${email}`);
            } catch (emailError) {
                console.error('❌ Failed to send OTP email:', emailError);
                return res.status(500).json({ 
                    errors: [{ msg: 'Failed to send verification email. Please try again.' }] 
                });
            }

            res.status(200).json({
                msg: 'New verification code sent to your email.',
                email: email
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

            // Check if user is verified
            if (!user.is_verified) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Please verify your email before logging in.' }] });
            }

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
