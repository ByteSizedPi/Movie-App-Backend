import http from 'axios';
import { from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { YTS_BASE_URL } from '../other/other';
import { YTSMovie, YTSResponse } from '../types/YTS';

export class YTSController {
	static httpGet(apiPath: string): Observable<YTSMovie[]> {
		const url = YTS_BASE_URL + apiPath;
		return from(http.get(url)).pipe(
			map(this.type),
			catchError(() => [])
		);
	}

	static type = ({
		data: {
			data: { movie, movies },
		},
	}: YTSResponse): YTSMovie[] => {
		if (movies) return movies;
		if (movie) return [movie];
		return [];
	};

	// api calls
	static getById = (id: number): Observable<YTSMovie> =>
		this.httpGet(`movie_details.jsonp?movie_id=${id}&with_cast=true`).pipe(
			map(([movie]) => movie)
		);

	static search = (term: string): Observable<YTSMovie> =>
		this.httpGet(`list_movies.jsonp?query_term=${term}`).pipe(
			tap((arr) => console.log(arr)),
			switchMap((arr) => arr),
			mergeMap(({ id }) => this.getById(id))
		);

	static getMovieByIMDBId = (id: string): Observable<YTSMovie | null> =>
		this.httpGet(`movie_details.jsonp?imdb_id=${id}`).pipe(
			// map(([movie]) => movie.id ? movie : null)),
			// filter(([{ id }]) => !!id),
			switchMap(([{ id }]) => (id > 0 ? this.getById(id) : of(null)))
		);
}
