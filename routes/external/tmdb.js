const { TMDB_BASE_URL, API_KEY } = require("../../other/other");
const { forkJoin } = require("rxjs");
const {
  catchError,
  filter,
  map,
  tap,
  mergeMap,
  switchMap,
  retry,
} = require("rxjs/operators");

const { from } = require("rxjs");

const http = require("axios");
const KEY = `api_key=${API_KEY}`;
const LANG = "&language=en-US";

//determine TMDB return type and reduce to TMDBMovie array
const type = ({ data }) => {
  if (data.results) return data.results;
  if (data.id) return [data];
  if (data.movie_results) return data.movie_results;
  return [];
};

//all movie requests go through httpGet to return conformed results
const httpGet = (apiString, imdb = "") => {
  const url = TMDB_BASE_URL + apiString + KEY + LANG + imdb;
  return from(http.get(url)).pipe(
    map((res) => type(res)),
    catchError(() => [])
  );
};

//additional get requests for movie related queries
const httpGetReviews = (apiString) =>
  from(http.get(TMDB_BASE_URL + apiString + KEY)).pipe(
    map(({ data: { results } }) => results),
    catchError(() => [])
  );

const httpGetProviders = (apiString) =>
  from(http.get(TMDB_BASE_URL + apiString + KEY)).pipe(
    map(({ data: { results } }) =>
      results.US?.flatrate ? results.US?.flatrate : []
    ),
    catchError(() => [])
  );

//get movie array by Group type
const getMovieGroup = (query) =>
  getFull(query === "trending" ? `trending/all/week?` : `movie/${query}?`);

//get recommended for specific movie
const getRecommended = (id) => getFull(`movie/${id}/recommendations?`);

//get recommended for specific movie
const getSimilar = (id) => getFull(`movie/${id}/similar?`);

//get Movie array (by group) then send each movie to getById
const getFull = (queryGroup) =>
  httpGet(queryGroup).pipe(
    switchMap((arr) => arr),
    mergeMap(({ id }) => getById(id))
  );

//get full movie, reviews and providers then combine into object
const getById = (id) => {
  //   console.log(id);
  return forkJoin([
    httpGet(`movie/${id}?`),
    httpGetReviews(`movie/${id}/reviews?`),
    httpGetProviders(`movie/${id}/watch/providers?`),
  ]).pipe(
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
const getMovieByIMDBId = (id) =>
  httpGet(`find/${id}?`, "&external_source=imdb_id").pipe(
    switchMap(([{ id }]) => getById(id))
  );

module.exports = {
  getMovieGroup,
  getRecommended,
  getSimilar,
  getMovieByIMDBId,
};
