import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import morgan from 'morgan';
import './config/db.config';
import { authRouter } from './routes/authRouter';
import { moviesRouter } from './routes/moviesRouter';
import { streamRouter } from './routes/streamRouter';
import { userRouter } from './routes/userRouter';

const app: Express = express();

app.use([
	express.json(),
	cors({
		origin: 'http://localhost:4200',
		methods: ['GET', 'POST', 'DELETE', 'PUT'],
		credentials: true,
	}),
	cookieParser(),
	morgan('dev'),
]);

app.use('/auth', authRouter);
app.use('/movies', moviesRouter);
app.use('/user', userRouter);
app.use('/stream', streamRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server started on localhost:${port}`));
