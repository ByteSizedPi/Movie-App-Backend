import http from 'axios';
import { from, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

const API_KEY = process.env.API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3/';
const YTS_BASE_URL = 'https://yts.torrentbay.net/api/v2/';
const IMG_URL = 'https://image.tmdb.org/t/p/';
const posterSizes = ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'];
const backdrop_sizes = ['w300', 'w780', 'w1280', 'original'];

export {
	API_KEY,
	backdrop_sizes,
	IMG_URL,
	posterSizes,
	TMDB_BASE_URL,
	YTS_BASE_URL,
};

export const fetch = <T>(url: string): Observable<T> => {
	return from(<Promise<T>>http.get(url)).pipe(
		catchError((err) => {
			console.log('Error: ' + url);
			return from([]);
		})
	);
};
