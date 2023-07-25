import http from 'axios';
import { forkJoin, from, Observable } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { API_KEY, fetch, TMDB_BASE_URL } from '../other/other';
import { Provider, Review, TMDBMovie, TMDBResponse } from '../types/TMDB';

const KEY = `api_key=${API_KEY}`;
const LANG = '&language=en-US';

export class TMDBController {
	//determine TMDB return type and reduce to TMDBMovie array
	static type = ({ data }: TMDBResponse): TMDBMovie[] => {
		if (data.results) return data.results;
		if (data.id) return [data];
		if (data.movie_results) return data.movie_results;
		return [];
	};

	//all movie requests go through httpGet to return conformed results
	static httpGet(
		apiString: string,
		imdb: string = ''
	): Observable<TMDBMovie[]> {
		const url = TMDB_BASE_URL + apiString + KEY + LANG + imdb;
		return fetch<TMDBResponse>(url).pipe(map(this.type));
	}

	// get partial movie array
	// static getGroup(query: string): Observable<PartialMovie[]> {
	// 	const qString =
	// 	TMDB_BASE_URL+
	// 		query === 'trending' ? `trending/all/week?` : `movie/${query}?`+ KEY + LANG;
	// 	return fetch<TMDBResponse>(TMDB_BASE_URL + qString + KEY).pipe(map({results}))
	// }

	//additional get requests for movie related queries
	static httpGetReviews = (apiString: string): Observable<Review[]> =>
		from(http.get(TMDB_BASE_URL + apiString + KEY)).pipe(
			map(({ data: { results } }) => results),
			catchError(() => [])
		);

	static httpGetProviders = (apiString: string): Observable<Provider[]> =>
		from(http.get(TMDB_BASE_URL + apiString + KEY)).pipe(
			map(({ data: { results } }) => results.US?.flatrate ?? []),
			catchError(() => [])
		);

	//get movie array by Group type
	static getMovieGroup = (query: string): Observable<TMDBMovie> =>
		this.getFull(
			query === 'trending' ? `trending/all/week?` : `movie/${query}?`
		);

	//get recommended for specific movie
	static getRecommended = (id: number): Observable<TMDBMovie> =>
		this.getFull(`movie/${id}/recommendations?`);

	//get recommended for specific movie
	static getSimilar = (id: number): Observable<TMDBMovie> =>
		this.getFull(`movie/${id}/similar?`);

	//get Movie array (by group) then send each movie to getById
	static getFull = (queryGroup: string): Observable<TMDBMovie> =>
		this.httpGet(queryGroup).pipe(
			switchMap((arr) => arr),
			mergeMap(({ id }) => this.getById(id))
		);

	//get full movie, reviews and providers then combine into object
	static getById = (id: number): Observable<TMDBMovie> => {
		// console.log(id);
		return forkJoin([
			this.httpGet(`movie/${id}?`),
			this.httpGetReviews(`movie/${id}/reviews?`),
			this.httpGetProviders(`movie/${id}/watch/providers?`),
		]).pipe(
			// tap((r) => console.log(r)),
			filter((movie) => !!movie[0]),
			map(([movie, reviews, providers]) => {
				return {
					...movie[0],
					reviews: reviews,
					providers: providers,
				};
			})
		);
	};

	//when searched by imdb_id, since limited results are returned, pass to getById for full results
	static getMovieByIMDBId = (id: string): Observable<TMDBMovie> => {
		return this.httpGet(`find/${id}?`, '&external_source=imdb_id').pipe(
			switchMap(([{ id }]) => this.getById(id))
		);
	};
}
