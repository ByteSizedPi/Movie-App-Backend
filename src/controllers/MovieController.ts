import { Request, Response } from 'express';
import NodeCache from 'node-cache';
import { Observable, map, switchMap } from 'rxjs';
import { Movie, PartialMovie } from '../types/Movie';
import { TMDBMovie } from '../types/TMDB';
import { YTSMovie } from '../types/YTS';
import { TMDBController as TMDB } from './TMDBController';
import { YTSController as YTS } from './YTSController';

// const cache = new NodeCache({ stdTTL: 60 * 200, checkperiod: 60 * 200 });
const cache = new NodeCache({ stdTTL: 0 });

export namespace MovieController {
	function sendContent<T>(
		req: Request,
		res: Response,
		obs: Observable<T>
	): void {
		const cached = cache.has(req.url);
		if (cached) {
			res.send(cache.get(req.url));
			return;
		}

		obs.subscribe({
			next: (content) => {
				cache.set(req.url, content);
				res.send(content);
			},
			error: () => res.send([]),
		});
	}

	export function getGroup(req: Request, res: Response): void {
		const obs = TMDB.getGroup(req.params.group);
		sendContent<PartialMovie[]>(req, res, obs);
	}

	export const getRecommended = (req: Request, res: Response) => {
		const obs = TMDB.getRecommended(Number(req.params.tmdb_id));
		sendContent<PartialMovie[]>(req, res, obs);
	};

	export const getSimilar = (req: Request, res: Response) => {
		const obs = TMDB.getSimilar(Number(req.params.tmdb_id));
		sendContent<PartialMovie[]>(req, res, obs);
	};

	export const getSearch = (req: Request, res: Response) => {
		const obs = TMDB.searchMovie(req.params.query);
		sendContent<PartialMovie[]>(req, res, obs);
	};

	export function getMovieByTMDBId(req: Request, res: Response): void {
		const obs = TMDB.getMovieByTMDBId(Number(req.params.tmdb_id)).pipe(
			switchMap((tmdbMovie) =>
				YTS.getMovieByIMDBId(tmdbMovie.imdb_id).pipe(
					// tap((ytsMovie) => {
					// 	if (!ytsMovie) {
					// 		console.log('no yts movie');
					// 	}
					// 	// console.log(ytsMovie)
					// }),
					map((ytsMovie) => merge(tmdbMovie, ytsMovie))
				)
			)
		);
		sendContent<Movie>(req, res, obs);
	}

	//query first api for movie/movies then get same movie from other api, return as array

	// const getYTS_TMDB = (f1: YTSFunc, f2: TMDBFunc): Observable<Movie[]> => {
	// 	let ytsCount = 0;
	// 	let tmdbCount = 0;
	// 	let start = new Date().getTime();

	// 	return f1().pipe(
	// 		tap((_) => ++ytsCount),
	// 		last((_) => {
	// 			Log.yts(ytsCount, start);
	// 			return true;
	// 		}),
	// 		// finalize(() => Log.yts(ytsCount, start)),
	// 		mergeMap((yts) =>
	// 			f2(yts).pipe(
	// 				tap((_) => ++tmdbCount),
	// 				map((tmdb) => merge(tmdb, yts))
	// 			)
	// 		),
	// 		toArray(),
	// 		finalize(() => Log.tmdb(tmdbCount, start))
	// 	);
	// };

	// const getTMDB_YTS = (f1: TMDBFunc, f2: YTSFunc): Observable<Movie[]> => {
	// 	let tmdbCount = 0;
	// 	let ytsCount = 0;
	// 	let start = new Date().getTime();

	// 	return f1().pipe(
	// 		tap((_) => ++tmdbCount),
	// 		finalize(() => Log.tmdb(tmdbCount, start)),

	// 		mergeMap((tmdb) =>
	// 			f2(tmdb).pipe(
	// 				tap((_) => ++ytsCount),
	// 				map((yts) => merge(tmdb, yts))
	// 			)
	// 		),
	// 		toArray(),
	// 		finalize(() => Log.yts(ytsCount, start))
	// 	);
	// };

	//merge TMDB movie and YTS movie into Movie type

	const merge = (tmdb: TMDBMovie, yts: YTSMovie | null): Movie => {
		if (!yts)
			return {
				tmdb_id: tmdb.id,
				imdb_id: tmdb.imdb_id,
				budget: tmdb.budget,
				description_full: tmdb.overview,
				genres: tmdb.genres.map(({ name }) => name),
				other_rating: tmdb.vote_average,
				revenue: tmdb.revenue,
				runtime: tmdb.runtime,
				summary: tmdb.overview,
				title: tmdb.title,
				release_date: tmdb.release_date,
				poster: tmdb.poster_path,
				backdrop: tmdb.backdrop_path,
			};
		return {
			yts_id: yts.id,
			tmdb_id: tmdb.id,
			imdb_id: yts.imdb_code ?? tmdb.imdb_id,
			budget: tmdb.budget,
			description_full: yts.description_full ?? tmdb.overview,
			genres: yts.genres ?? tmdb.genres.map(({ name }) => name),
			language: yts.language,
			mpa_rating: yts.mpa_rating,
			// providers: tmdb.providers,
			imdb_rating: yts.rating,
			other_rating: tmdb.vote_average,
			revenue: tmdb.revenue,
			// reviews: tmdb.reviews,
			runtime: yts.runtime,
			summary: tmdb.overview,
			title: yts.title_english ?? tmdb.title,
			release_date: tmdb.release_date ?? yts.year,
			yt_trailer: yts.yt_trailer_code,
			poster: tmdb.poster_path,
			backdrop: tmdb.backdrop_path,
			cast: yts.cast,
			torrents: yts.torrents,
		};
	};
}
