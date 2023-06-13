import { config as dotEnvConfig } from 'dotenv';
import mongoose from 'mongoose';

function appConfig() {
	dotEnvConfig();
	console.log(process.env.DATABASE_URL);
	mongoose.connect(process.env.DATABASE_URL);
	const db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', () => console.log('connected to database'));
}

// export { appConfig };
