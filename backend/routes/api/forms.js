const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../DB/models/User');
const Form = require('../../DB/models/Form');
const jwtTokenDecoder = require('../../middleware/jwtTokenDecoder');

// route to handle form creation requests
// POST /api/forms
// access private
router.post(
	'/create',
	[
		jwtTokenDecoder,
		[
			check('title', 'Title is required').not().isEmpty(),
			check('layout', 'Layout is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const userId = req.user.id;
		const { title, layout } = req.body;

		try {
			const userExists = await User.findOne({ _id: userId }).select(
				'_id'
			);

			if (!userExists) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'User does not exist' }] });
			}

			const newForm = new Form({
				user: userId,
				title: title,
				layout: layout,
			});

			await newForm.save();

			res.status(201).json({
				msg: 'Form created successfully',
			});
		} catch (error) {
			console.error(error);
			res.status(500).send('Server error');
		}
	}
);

// route to handle form updation requests
// PATCH /api/forms
// access private
router.patch(
	'/update',
	[jwtTokenDecoder, [check('formId', 'Form ID is required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const userId = req.user.id;
		const { formId, title, layout, public } = req.body;

		try {
			const userExists = await User.findOne({ _id: userId }).select(
				'_id'
			);

			if (!userExists) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'User does not exist' }] });
			}

			const formExists = await Form.findOne({ _id: formId });

			if (!formExists) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Form does not exist' }] });
			}

			if (formExists.user.toString() !== userId) {
				return res.status(403).json({ msg: 'Access denied' });
			}

			if (typeof public === 'boolean') {
				formExists.public = public;
				await formExists.save();
				return res.status(200).json({
					msg: 'Form visibility updated successfully',
				});
			}

			if (title) {
				formExists.title = title;
			}
			if (layout) {
				formExists.layout = layout;
			}
			formExists.modified = true;
			formExists.date = Date.now();
			await formExists.save();
			res.status(200).json({
				msg: 'Form updated successfully',
			});
		} catch (error) {
			console.error(error);
			res.status(500).send('Server error');
		}
	}
);

// route to handle form deletion requests
// DELETE /api/forms
// access private
router.delete('/d/:formId', jwtTokenDecoder, async (req, res) => {
	const userId = req.user.id;
	const formId = req.params.formId;

	try {
		const userExists = await User.findOne({ _id: userId }).select('_id');

		if (!userExists) {
			return res
				.status(400)
				.json({ errors: [{ msg: 'User does not exist' }] });
		}

		const formExists = await Form.findOne({ _id: formId }).select(
			'_id user'
		);

		if (!formExists) {
			return res
				.status(400)
				.json({ errors: [{ msg: 'Form does not exist' }] });
		}

		if (formExists.user.toString() !== userId) {
			return res.status(403).json({ msg: 'Access denied' });
		}

		await Form.deleteOne({ _id: formId });

		res.status(200).json({
			msg: 'Form deleted successfully',
		});
	} catch (error) {
		console.error(error);
		res.status(500).send('Server error');
	}
});

// route to handle my forms fetch requests
// GET /api/forms
// access private
router.get('/my-forms', [jwtTokenDecoder], async (req, res) => {
	const userId = req.user.id;

	try {
		const userExists = await User.findOne({ _id: userId }).select('_id');

		if (!userExists) {
			return res
				.status(400)
				.json({ errors: [{ msg: 'User does not exist' }] });
		}

		const my_forms = await Form.find({ user: userId })
			.select('_id title date modified')
			.sort({ date: -1 });

		if (!my_forms || my_forms.length === 0) {
			return res.status(404).json({ msg: 'No forms found' });
		}

		res.status(200).json(my_forms);
	} catch (error) {
		console.error(error);
		res.status(500).send('Server error');
	}
});

// route to handle form fetch to submit requests
// GET /api/forms
// access public
router.get('/s/:formId', async (req, res) => {
	const formId = req.params.formId;

	try {
		const formExists = await Form.findOne({ _id: formId }).select(
			'_id title layout public'
		);

		if (!formExists) {
			return res
				.status(400)
				.json({ errors: [{ msg: 'Form does not exist' }] });
		}

		if (!formExists.public) {
			return res.status(403).json({ msg: 'Form is private' });
		}

		formExists.public = undefined;

		res.status(200).json(formExists);
	} catch (error) {
		console.error(error);
		res.status(500).send('Server error');
	}
});

// route to handle form fetch to change requests
// GET /api/forms
// access private
router.get('/f/:formId', [jwtTokenDecoder], async (req, res) => {
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
			'_id user title layout public'
		);

		if (!formExists) {
			return res
				.status(400)
				.json({ errors: [{ msg: 'Form does not exist' }] });
		}
		if (formExists.user.toString() !== userId) {
			return res.status(403).json({ msg: 'Access denied' });
		}

		formExists.user = undefined;

		res.status(200).json(formExists);
	} catch (error) {
		console.error(error);
		res.status(500).send('Server error');
	}
});

module.exports = router;
