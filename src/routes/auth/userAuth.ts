import bcrypt from 'bcrypt';
import { serialize } from 'cookie';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/UserSchema';

export async function usernameExists(username: string): Promise<boolean> {
	if (!username) return false;
	try {
		return !!(await User.findOne({ username }));
	} catch {
		return false;
	}
}

export async function usernameExists_(
	{ body: { username } }: Request,
	res: Response,
	next?: NextFunction
) {
	if (!username) return res.status(400).json('No credentials provided');

	try {
		const results = await User.findOne({ username });
		if (!results) return res.status(401).json('Username not found');
		if (next) next();
		else res.status(200).json({ username });
	} catch ({ message: error }: any) {
		res.status(500).send({ error });
	}
}

export async function verifyPassword_(
	req: Request,
	res: Response,
	next?: NextFunction
) {
	const {
		body: { username, password },
	} = req;

	if (!username || !password)
		return res.status(400).json('No credentials provided');

	try {
		const results = await User.findOne({ username });
		if (!results) return res.status(401).json('User not found');

		const validPassword = bcrypt.compareSync(password, results.password);
		if (!validPassword) return res.status(401).json('Incorrect password');

		if (next) next();
		else res.status(200).json({ username });
	} catch ({ message: error }: any) {
		res.status(500).send({ error });
	}
}

export async function setAuthCookie_(
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

export async function authSession_(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const token = req.cookies.jwt;
	if (!token) return res.status(401).json('No token provided');

	try {
		const verified = jwt.verify(token, 'secret');
		req.user = verified;
		next();
	} catch ({ message }: any) {
		res.status(400).json({ error: message });
	}
}
