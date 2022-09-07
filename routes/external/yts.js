// import { http } from "./movies";
const { YTS_BASE_URL } = require("../../other/other");
const {
  catchError,
  filter,
  map,
  mergeMap,
  switchMap,
} = require("rxjs/operators");

const { from, tap } = require("rxjs");

const http = require("axios");

//makes request to YTS API and map to movies Array using type()
const httpGet = (apiString) => {
  const url = YTS_BASE_URL + apiString;
  return from(http.get(url)).pipe(
    map((res) => type(res)),
    catchError(() => [])
  );
};

//Map API results into movie array
const type = ({
  data: {
    data: { movies, movie },
  },
}) => {
  if (movies) return movies;
  if (movie) return [movie];
  return [];
};

const search = (queryGroup) =>
  httpGet(`list_movies.jsonp?query_term=${queryGroup}`).pipe(
    switchMap((arr) => arr),
    mergeMap(({ id }) => getById(id))
  );

const getMovieByIMDBId = (id) =>
  httpGet(`movie_details.jsonp?imdb_id=${id}`).pipe(
    filter(([{ id }]) => !!id),
    switchMap(([{ id }]) => getById(id))
  );

const getById = (id) =>
  httpGet(`movie_details.jsonp?movie_id=${id}&with_cast=true`).pipe(
    map(([movie]) => movie)
  );

module.exports = { search, getMovieByIMDBId };
