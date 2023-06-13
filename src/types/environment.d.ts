export {};

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DATABASE_URL: string;
		}
	}
	namespace Express {
		interface Request {
			user: any;
		}
	}
}
