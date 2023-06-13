import { Request, Response } from 'express';
import NodeCache from 'node-cache';
import { Observable, finalize, last, map, mergeMap, tap, toArray } from 'rxjs';
import { Movie, TMDBFunc, YTSFunc } from '../models/Movie';
import { TMDBMovie } from '../models/TMDB';
import { YTSMovie } from '../models/YTS';
import * as Log from '../other/logs';
import { TMDBController as TMDB } from './TMDBController';
import { YTSController as YTS } from './YTSController';

const cache = new NodeCache({ stdTTL: 60 * 200, checkperiod: 60 * 200 });

export class MovieController {
	static searchMovies = (query: string): Observable<Movie[]> =>
		this.getYTS_TMDB(
			() => YTS.search(query),
			({ imdb_code }) => TMDB.getMovieByIMDBId(imdb_code)
		);

	//Different movie group requests

	static movieGroup = (group: string): Observable<Movie[]> =>
		this.YTSIMDB(() => TMDB.getMovieGroup(group));

	static recommended = (tmdb_id: number): Observable<Movie[]> =>
		this.YTSIMDB(() => TMDB.getRecommended(tmdb_id));

	static similar = (tmdb_id: number): Observable<Movie[]> =>
		this.YTSIMDB(() => TMDB.getSimilar(tmdb_id));

	//helper function where second function is to get movies from YTS by ID
	static YTSIMDB = (f: TMDBFunc): Observable<Movie[]> =>
		this.getTMDB_YTS(f, ({ imdb_id }) => YTS.getMovieByIMDBId(imdb_id));

	//query first api for movie/movies then get same movie from other api, return as array

	static getYTS_TMDB = (f1: YTSFunc, f2: TMDBFunc): Observable<Movie[]> => {
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
					map((tmdb) => this.merge(tmdb, yts))
				)
			),
			toArray(),
			finalize(() => Log.tmdb(tmdbCount, start))
		);
	};

	static getTMDB_YTS = (f1: TMDBFunc, f2: YTSFunc): Observable<Movie[]> => {
		let tmdbCount = 0;
		let ytsCount = 0;
		let start = new Date().getTime();

		return f1().pipe(
			tap((_) => ++tmdbCount),
			finalize(() => Log.tmdb(tmdbCount, start)),

			mergeMap((tmdb) =>
				f2(tmdb).pipe(
					tap((_) => ++ytsCount),
					map((yts) => this.merge(tmdb, yts))
				)
			),
			toArray(),
			finalize(() => Log.yts(ytsCount, start))
		);
	};

	//merge TMDB movie and YTS movie into Movie type

	static merge = (tmdb: TMDBMovie, yts: YTSMovie): Movie => {
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
			providers: tmdb.providers,
			rating: yts.rating,
			revenue: tmdb.revenue,
			reviews: tmdb.reviews,
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

	static sendMovies = (
		obs: Observable<Movie[]>,
		req: Request,
		res: Response<Movie[]>
	) => {
		// const cached = cache.has(req.url);
		// if (cached) return res.send(cache.get(req.url));

		obs.subscribe(
			(movies) => {
				// cache.set(req.url, movies);
				res.send(movies);
			},
			(err) => res.send([])
		);
	};

	static getSearch = (req: Request, res: Response) => {
		this.sendMovies(this.searchMovies(req.params.query), req, res);
	};

	static getMovieGroup = (req: Request, res: Response) => {
		this.sendMovies(this.movieGroup(req.params.group), req, res);
	};

	static getRecommended = (req: Request, res: Response) => {
		this.sendMovies(this.recommended(Number(req.params.tmdb_id)), req, res);
	};

	static getSimilar = (req: Request, res: Response) => {
		this.sendMovies(this.similar(Number(req.params.tmdb_id)), req, res);
	};
}
