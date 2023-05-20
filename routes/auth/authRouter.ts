import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.get('', (req: Request, res: Response) => {
	const token = req.cookies.jwt;
	if (!token) return res.json(false);
	try {
		const verified = jwt.verify(token, 'secret');
		console.log('verified:', !!verified);
		return res.json(!!verified);
	} catch {
		return res.json(false);
	}
});

export { router as authRouter };
