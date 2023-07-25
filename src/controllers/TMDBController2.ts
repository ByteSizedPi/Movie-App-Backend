import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_KEY, TMDB_BASE_URL, fetch } from '../other/other';
import { PartialMovie } from '../types/Movie';
import { TMDBMovie, TMDBPartialMovie } from '../types/TMDB';

const KEY = `api_key=${API_KEY}`;
const LANG = '&language=en-US';

export namespace TMDBResponse {
	export type TrendingMovies = {
		data: { results: TMDBPartialMovie[] };
	};
	export type MovieByTMDBID = {
		data: TMDBMovie;
	};
}

export namespace TMDBControllerV2 {
	function httpGet<T>(apiString: string, imdb: string = ''): Observable<T> {
		const url = TMDB_BASE_URL + apiString + KEY + LANG + imdb;
		return fetch<T>(url);
	}

	// get partial movie array by Group type
	export function getGroup(query: string): Observable<PartialMovie[]> {
		const qString =
			query === 'trending' ? `trending/all/week?` : `movie/${query}?`;

		return httpGet<TMDBResponse.TrendingMovies>(qString).pipe(
			map(({ data: { results } }) =>
				results.map((movie) => ({
					tmdb_id: movie.id,
					poster: movie.poster_path,
					backdrop: movie.backdrop_path,
					title: movie.title,
				}))
			)
		);
	}

	//get full movie by tmdb id
	export function getMovieByTMDBId(id: number): Observable<TMDBMovie> {
		return httpGet<TMDBResponse.MovieByTMDBID>(`movie/${id}?`).pipe(
			map(({ data }) => data)
		);
	}
}
