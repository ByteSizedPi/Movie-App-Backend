import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import User from '../models/UserSchema';

export class UserController {
	static async register(req: Request, res: Response) {
		const user = await User.findOne({ username: req.body.username });
		if (user) return res.status(400).send({ error: 'user already exists' });

		try {
			const { username, password, email, firstName, lastName } = req.body;
			const validUser = username && password && email && firstName && lastName;
			if (!validUser) return res.status(400).send({ error: 'missing fields' });

			const hashedPassword = await bcrypt.hash(password, 10);

			await User.create({
				username,
				password: hashedPassword,
				email,
				firstName,
				lastName,
			});
			res.status(201).send({ message: 'user created successfully' });
		} catch ({ message }: any) {
			res.status(500).send({ error: message });
		}
	}

	static async getUserList(req: Request, res: Response) {
		try {
			const { id } = req.user;
			const list = await User.findOne({ _id: id }, { shows_list: 1 });
			res.json({ list: list?.shows_list });
		} catch ({ message }: any) {
			res.status(500).send({ error: message });
		}
	}

	static async getUserListIDs(req: Request, res: Response) {
		const { id } = req.user;
		res.json({ list: await User.distinct('shows_list.imdb_id', { _id: id }) });
	}

	static async postUserList(req: Request, res: Response) {
		const { id } = req.user;
		const { show } = req.body;
		try {
			const result = await User.updateOne(
				{ _id: id },
				{ $addToSet: { shows_list: show } }
			);
			if (!result) return res.status(400).send({ error: 'user not found' });
			res.status(200).send({ message: 'show added to list' });
		} catch ({ message }: any) {
			res.status(500).send({ error: message });
		}
	}

	static async deleteShowByID(req: Request, res: Response) {
		const { id } = req.user;
		const { imdb_id } = req.params;
		try {
			const result = await User.updateOne(
				{ _id: id },
				{ $pull: { shows_list: { imdb_id } } }
			);
			if (!result) return res.status(400).send({ error: 'user not found' });
			res.status(200).send({ message: 'show removed from list' });
		} catch ({ message }: any) {
			res.status(500).send({ error: message });
		}
	}
}
