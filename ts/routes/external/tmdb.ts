import http from "axios";
import { forkJoin, from, Observable, of } from "rxjs";
import {
  catchError,
  filter,
  map,
  mergeMap,
  switchMap,
  tap,
} from "rxjs/operators";
import { API_KEY, TMDB_BASE_URL, fetch } from "../../other/other";

const KEY = `api_key=${API_KEY}`;
const LANG = "&language=en-US";

type Review = {
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string;
    rating: string;
  };
  content: string;
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
};

type Provider = {
  logo_path: string;
  provider_name: string;
};

type TMDBMovie = {
  id: number;
  imdb_id: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  budget: number;
  revenue: number;
  reviews: Review[];
  providers: Provider[];
};

type TMDBResponse = {
  data: { results: TMDBMovie[] } & { movie_results: TMDBMovie[] } & TMDBMovie;
};

//determine TMDB return type and reduce to TMDBMovie array
const type = ({ data }: TMDBResponse): TMDBMovie[] => {
  if (data.results) return data.results;
  if (data.id) return [data];
  if (data.movie_results) return data.movie_results;
  return [];
};

//all movie requests go through httpGet to return conformed results
const httpGet = (
  apiString: string,
  imdb: string = ""
): Observable<TMDBMovie[]> => {
  const url = TMDB_BASE_URL + apiString + KEY + LANG + imdb;
  return fetch<TMDBResponse>(url).pipe(map(type));
};

//additional get requests for movie related queries
const httpGetReviews = (apiString: string): Observable<Review[]> =>
  from(http.get(TMDB_BASE_URL + apiString + KEY)).pipe(
    map(({ data: { results } }) => results),
    catchError(() => [])
  );

const httpGetProviders = (apiString: string): Observable<Provider[]> =>
  from(http.get(TMDB_BASE_URL + apiString + KEY)).pipe(
    map(({ data: { results } }) =>
      results.US?.flatrate ? results.US?.flatrate : []
    ),
    catchError(() => [])
  );

//get movie array by Group type
const getMovieGroup = (query: string): Observable<TMDBMovie> =>
  getFull(query === "trending" ? `trending/all/week?` : `movie/${query}?`);

//get recommended for specific movie
const getRecommended = (id: number): Observable<TMDBMovie> =>
  getFull(`movie/${id}/recommendations?`);

//get recommended for specific movie
const getSimilar = (id: number): Observable<TMDBMovie> =>
  getFull(`movie/${id}/similar?`);

//get Movie array (by group) then send each movie to getById
const getFull = (queryGroup: string): Observable<TMDBMovie> =>
  httpGet(queryGroup).pipe(
    switchMap((arr) => arr),
    mergeMap(({ id }) => getById(id))
  );

//get full movie, reviews and providers then combine into object
const getById = (id: number): Observable<TMDBMovie> => {
  // console.log(id);
  return forkJoin([
    httpGet(`movie/${id}?`),
    httpGetReviews(`movie/${id}/reviews?`),
    httpGetProviders(`movie/${id}/watch/providers?`),
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
const getMovieByIMDBId = (id: string): Observable<TMDBMovie> => {
  // console.log(id);
  return httpGet(`find/${id}?`, "&external_source=imdb_id").pipe(
    // tap((r) => console.log(r)),
    switchMap(([{ id }]) => getById(id))
  );
};

export {
  getMovieGroup,
  getRecommended,
  getSimilar,
  getMovieByIMDBId,
  TMDBMovie,
};
