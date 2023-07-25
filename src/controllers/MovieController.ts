import { Request, Response } from 'express';
import NodeCache from 'node-cache';
import {
	Observable,
	finalize,
	last,
	map,
	mergeMap,
	switchMap,
	tap,
	toArray,
} from 'rxjs';
import * as Log from '../other/logs';
import { Movie, PartialMovie, TMDBFunc, YTSFunc } from '../types/Movie';
import { TMDBMovie } from '../types/TMDB';
import { YTSMovie } from '../types/YTS';
import { TMDBController as TMDB } from './TMDBController';
import { TMDBControllerV2 as TMDB2 } from './TMDBController2';
import { YTSController as YTS } from './YTSController';

const cache = new NodeCache({ stdTTL: 60 * 200, checkperiod: 60 * 200 });

export namespace MovieController {
	function sendContent<T>(
		req: Request,
		res: Response,
		obs: Observable<T>
	): void {
		obs.subscribe({
			next: (content) => res.send(content),
			error: () => res.send([]),
		});
	}

	export function getGroup(req: Request, res: Response): void {
		const obs = TMDB2.getGroup(req.params.group);
		sendContent<PartialMovie[]>(req, res, obs);
	}

	export function getMovieByTMDBId(req: Request, res: Response): void {
		const obs = TMDB2.getMovieByTMDBId(Number(req.params.tmdb_id)).pipe(
			switchMap((tmdbMovie) =>
				YTS.getMovieByIMDBId(tmdbMovie.imdb_id).pipe(
					map((ytsMovie) => merge(tmdbMovie, ytsMovie))
				)
			)
		);
		sendContent<Movie>(req, res, obs);
	}

	// export function searchMovies = (query: string): Observable<Movie[]> =>
	// 	this.getYTS_TMDB(
	// 		() => YTS.search(query),
	// 		({ imdb_code }) => TMDB.getMovieByIMDBId(imdb_code)
	// 	);

	//Different movie group requests

	export const movieGroup = (group: string): Observable<Movie[]> =>
		YTSIMDB(() => TMDB.getMovieGroup(group));

	export const recommended = (tmdb_id: number): Observable<Movie[]> =>
		YTSIMDB(() => TMDB.getRecommended(tmdb_id));

	export const similar = (tmdb_id: number): Observable<Movie[]> =>
		YTSIMDB(() => TMDB.getSimilar(tmdb_id));

	//helper function where second function is to get movies from YTS by ID
	export const YTSIMDB = (f: TMDBFunc): Observable<Movie[]> =>
		getTMDB_YTS(f, ({ imdb_id }) => YTS.getMovieByIMDBId(imdb_id));

	//query first api for movie/movies then get same movie from other api, return as array

	export const getYTS_TMDB = (
		f1: YTSFunc,
		f2: TMDBFunc
	): Observable<Movie[]> => {
		let ytsCount = 0;
		let tmdbCount = 0;
		let start = new Date().getTime();

		return f1().pipe(
			tap((_) => ++ytsCount),
			last((_) => {
				Log.yts(ytsCount, start);
				return true;
			}),
			// finalize(() => Log.yts(ytsCount, start)),
			mergeMap((yts) =>
				f2(yts).pipe(
					tap((_) => ++tmdbCount),
					map((tmdb) => merge(tmdb, yts))
				)
			),
			toArray(),
			finalize(() => Log.tmdb(tmdbCount, start))
		);
	};

	export const getTMDB_YTS = (
		f1: TMDBFunc,
		f2: YTSFunc
	): Observable<Movie[]> => {
		let tmdbCount = 0;
		let ytsCount = 0;
		let start = new Date().getTime();

		return f1().pipe(
			tap((_) => ++tmdbCount),
			finalize(() => Log.tmdb(tmdbCount, start)),

			mergeMap((tmdb) =>
				f2(tmdb).pipe(
					tap((_) => ++ytsCount),
					map((yts) => merge(tmdb, yts))
				)
			),
			toArray(),
			finalize(() => Log.yts(ytsCount, start))
		);
	};

	//merge TMDB movie and YTS movie into Movie type

	const merge = (tmdb: TMDBMovie, yts: YTSMovie): Movie => {
		// console.log(tmdb, yts);
		return {
			yts_id: yts.id,
			tmdb_id: tmdb.id,
			imdb_id: yts.imdb_code ?? tmdb.imdb_id,
			budget: tmdb.budget,
			description_full: yts.description_full,
			genres: yts.genres,
			language: yts.language,
			mpa_rating: yts.mpa_rating,
			// providers: tmdb.providers,
			rating: yts.rating,
			revenue: tmdb.revenue,
			// reviews: tmdb.reviews,
			runtime: yts.runtime,
			summary: tmdb.overview,
			title: yts.title_english,
			year: yts.year,
			yt_trailer: yts.yt_trailer_code,
			poster: tmdb.poster_path,
			backdrop: tmdb.backdrop_path,
			cast: yts.cast,
			torrents: yts.torrents,
		};
	};

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

	// const getSearch = (req: Request, res: Response) => {
	// 	sendMovies(searchMovies(req.params.query), req, res);
	// };

	export const getMovieGroup = (req: Request, res: Response) => {
		sendMovies(movieGroup(req.params.group), req, res);
	};

	export const getRecommended = (req: Request, res: Response) => {
		sendMovies(recommended(Number(req.params.tmdb_id)), req, res);
	};

	export const getSimilar = (req: Request, res: Response) => {
		sendMovies(similar(Number(req.params.tmdb_id)), req, res);
	};
}
