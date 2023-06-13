import bcrypt from 'bcrypt';
import { serialize } from 'cookie';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Middleware } from '../models/Models';
import User from '../models/UserSchema';

export class AuthController {
	@Middleware()
	static async usernameExists(
		{ body: { username } }: Request,
		res: Response,
		next?: NextFunction
	) {
		if (!username) return res.status(400).json('No credentials provided');

		const results = await User.findOne({ username });
		if (!results) return res.status(401).json('Username not found');
	}

	static async softVeryfyUsername(req: Request, res: Response) {
		const username = req.params.username;
		if (!username) return res.status(400).json('No credentials provided');

		const results = await User.findOne({ username });
		return res
			.status(200)
			.json({ username: results ? results.username : null });
	}

	@Middleware()
	static async verifyPassword(
		{ body: { username, password } }: Request,
		res: Response,
		next?: NextFunction
	) {
		if (!username || !password)
			return res.status(400).json('No credentials provided');

		const results = await User.findOne({ username });
		if (!results) return res.status(401).json('User not found');

		const validPassword = bcrypt.compareSync(password, results.password);
		if (!validPassword) return res.status(401).json('Incorrect password');
	}

	static async setAuthCookie(
		{ body: { username } }: Request,
		res: Response,
		next?: NextFunction
	) {
		const user = await User.findOne({ username });
		if (!user) return res.status(404).json('user not found');

		const tokenInfo = {
			username: user.username,
			id: user._id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			photoUrl: user.photoUrl,
		};
		const token = jwt.sign(tokenInfo, 'secret');
		const serialized = serialize('jwt', token, {
			httpOnly: true,
			path: '/',
			secure: false,
			sameSite: 'strict',
		});
		res.setHeader('Set-Cookie', serialized);
		res.json({
			message: 'Logged in successfully',
			token: token,
		});
	}

	@Middleware()
	static async authSession(req: Request, res: Response, next: NextFunction) {
		const token = req.cookies.jwt;
		if (!token) return res.status(401).json('No token provided');

		const verified = jwt.verify(token, 'secret');
		req.user = verified;
	}

	static async logout(req: Request, res: Response) {
		res.clearCookie('jwt');
		res.status(200).send({ message: 'logged out' });
	}
}
