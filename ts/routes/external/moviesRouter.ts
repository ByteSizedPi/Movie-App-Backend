import { Request, Response, Router } from 'express';
import NodeCache from 'node-cache';
import { Observable } from 'rxjs';
import {
	Movie,
	getMovieGroup,
	getRecommended,
	getSimilar,
	searchMovies,
} from './movies';

import { authSession_ } from '../auth/userAuth';

const router = Router();
router.use(authSession_);
const cache = new NodeCache({ stdTTL: 60 * 200, checkperiod: 60 * 200 });

const sendMovies = (
	obs: Observable<Movie[]>,
	req: Request,
	res: Response<Movie[]>
) => {
	const cached = cache.has(req.url);
	if (cached) return res.send(cache.get(req.url));

	obs.subscribe(
		(movies) => {
			cache.set(req.url, movies);
			res.send(movies);
		},
		(err) => res.send([])
	);
};

router.get('/search=:search', (req: Request, res: Response) =>
	sendMovies(searchMovies(req.params.search), req, res)
);

router.get('/group=:group', (req: Request, res: Response) =>
	sendMovies(getMovieGroup(req.params.group), req, res)
);

router.get(
	'/recommended=:tmdb_id',

	(req: Request, res: Response) =>
		sendMovies(getRecommended(+req.params.tmdb_id), req, res)
);

router.get('/similar=:tmdb_id', (req: Request, res: Response) =>
	sendMovies(getSimilar(+req.params.tmdb_id), req, res)
);

export { router as moviesRouter };
