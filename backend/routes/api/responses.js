const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../DB/models/User');
const Form = require('../../DB/models/Form');
const Response = require('../../DB/models/Response');
const jwtTokenDecoder = require('../../middleware/jwtTokenDecoder');

// route to handle response submission requests
// POST /api/responses
// access private
router.post(
	'/submit',
	[
		jwtTokenDecoder,
		[
			check('formId', 'Form ID is required').not().isEmpty(),
			check('response', 'Response is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const userId = req.user.id;
		const { formId, response } = req.body;

		try {
			const userExists = await User.findOne({ _id: userId }).select(
				'_id'
			);

			if (!userExists) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'User does not exist' }] });
			}

			const formExists = await Form.findOne({ _id: formId }).select(
				'_id public'
			);

			if (!formExists) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Form does not exist' }] });
			}

			if (!formExists.public) {
				return res.status(403).json({ msg: 'Form is private' });
			}

			const newResponse = new Response({
				user: userId,
				form: formId,
				response: response,
			});

			await newResponse.save();

			res.status(200).json({
				msg: 'Response submitted successfully',
			});
		} catch (error) {
			console.error(error);
			res.status(500).send('Server error');
		}
	}
);

// route to handle fetch My Submissions requests
// GET /api/responses
// access private
router.get('/my-submissions', [jwtTokenDecoder], async (req, res) => {
	const userId = req.user.id;

	try {
		const userExists = await User.findOne({ _id: userId }).select('_id');

		if (!userExists) {
			return res
				.status(400)
				.json({ errors: [{ msg: 'User does not exist' }] });
		}

		const responses = await Response.find({ user: userId })
			.populate('form', 'title')
			.sort({ date: -1 })
			.select('_id date');

		if (!responses || responses.length === 0) {
			return res.status(404).json({ msg: 'No responses found' });
		}

		res.status(200).json(responses);
	} catch (error) {
		console.error(error);
		res.status(500).send('Server error');
	}
});

// route to handle fetch Submission using id requests
// GET /api/responses
// access private
router.get('/s/:responseId', [jwtTokenDecoder], async (req, res) => {
	const userId = req.user.id;

	try {
		const userExists = await User.findOne({ _id: userId }).select('_id');

		if (!userExists) {
			return res
				.status(400)
				.json({ errors: [{ msg: 'User does not exist' }] });
		}

		const responseId = req.params.responseId;
		const responseExists = await Response.findOne({
			_id: responseId,
		})
			.populate('form', 'title')
			.select('_id user response date');
		if (!responseExists) {
			return res
				.status(400)
				.json({ errors: [{ msg: 'Response does not exist' }] });
		}
		if (responseExists.user.toString() !== userId) {
			return res
				.status(403)
				.json({ msg: 'You do not have access to this response' });
		}

		responseExists.user = undefined;

		res.status(200).json(responseExists);
	} catch (error) {
		console.error(error);
		res.status(500).send('Server error');
	}
});

// route to handle fetch responses for form requests
// GET /api/responses
// access private
router.get('/r/:formId', jwtTokenDecoder, async (req, res) => {
	const userId = req.user.id;

	try {
		const userExists = await User.findOne({ _id: userId }).select('_id');

		if (!userExists) {
			return res
				.status(400)
				.json({ errors: [{ msg: 'User does not exist' }] });
		}

		const formId = req.params.formId;
		const formExists = await Form.findOne({ _id: formId }).select(
			'_id user title'
		);

		if (!formExists) {
			return res
				.status(400)
				.json({ errors: [{ msg: 'Form does not exist' }] });
		}

		if (formExists.user.toString() !== userId) {
			return res
				.status(403)
				.json({ msg: 'You do not have access to this form' });
		}

		const responses = await Response.find({ form: formId })
			.populate('user', 'email')
			.populate('form', 'title')
			.sort({ date: -1 })
			.select('_id response date');

		if (!responses || responses.length === 0) {
			return res
				.status(404)
				.json({ msg: 'No responses found for this form' });
		}

		res.status(200).json(responses);
	} catch (error) {
		console.error(error);
		res.status(500).send('Server error');
	}
});

module.exports = router;
