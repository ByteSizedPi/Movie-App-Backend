import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import morgan from 'morgan';
// import fetch from 'node-fetch';
import * as swaggerUI from 'swagger-ui-express';
import swaggerDocument from '../swagger.json';
import './config/db.config';
import { authRouter } from './routes/authRouter';
import { moviesRouter } from './routes/moviesRouter';
import { streamRouter } from './routes/streamRouter';
import { userRouter } from './routes/userRouter';
// const fetch = require('node-fetch');

// 	.then((res) => res.json())
// 	.then(console.log)
// 	.catch(console.log);

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

app.use('/api-docs', swaggerUI.serve);
app.get('/api-docs', swaggerUI.setup(swaggerDocument));

app.use('/auth', authRouter);
app.use('/movies', moviesRouter);
app.use('/user', userRouter);
app.use('/stream', streamRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`server started on localhost:${port}`);
	// fetch('https://yts.mx/api/v2/movie_details.jsonp?imdb_id=tt26674627');
});
