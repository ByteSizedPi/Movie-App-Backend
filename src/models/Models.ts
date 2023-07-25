import { NextFunction, Request, Response } from 'express';

export function Middleware(): MethodDecorator {
	return function (target, propertyKey, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;
		descriptor.value = async function (
			req: Request,
			res: Response,
			next?: NextFunction
		): Promise<any> {
			try {
				await originalMethod.apply(this, [req, res, next]);
				if (next) next();
			} catch ({ message: error }: any) {
				return res.status(500).send({ error });
			}
		};
	};
}

export function TryCatch(): MethodDecorator {
	return function (target, propertyKey, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;
		descriptor.value = async function (
			req: Request,
			res: Response,
			next?: NextFunction
		): Promise<any> {
			try {
				return await originalMethod.apply(this, [req, res, next]);
			} catch ({ message: error }: any) {
				console.log(error);
				return res.status(500).send({ error });
			}
		};
	};
}
