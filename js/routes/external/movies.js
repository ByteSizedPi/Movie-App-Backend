const YTS = require("./yts");
const TMDB = require("./tmdb");
const { map, mergeMap, toArray, tap } = require("rxjs/operators");
const { from, of } = require("rxjs");
const http = require("axios");

// const http = from(axios);

const searchMovies = (query) =>
  getYTS_TMDB(
    () => YTS.search(query),
    ({ imdb_code }) => TMDB.getMovieByIMDBId(imdb_code)
  );

//Different movie group requests

const getMovieGroup = (group) => YTSIMDB(() => TMDB.getMovieGroup(group));

const getRecommended = (tmdb_id) => YTSIMDB(() => TMDB.getRecommended(tmdb_id));

const getSimilar = (tmdb_id) => YTSIMDB(() => TMDB.getSimilar(tmdb_id));

//helper function where second function is to get movies from YTS by ID
const YTSIMDB = (f) =>
  getTMDB_YTS(f, ({ imdb_id }) => YTS.getMovieByIMDBId(imdb_id));

//query first api for movie/movies then get same movie from other api, return as array

const getYTS_TMDB = (f1, f2) =>
  f1().pipe(
    mergeMap((yts) => f2(yts).pipe(map((tmdb) => merge(tmdb, yts)))),
    toArray()
  );

const getTMDB_YTS = (f1, f2) =>
  f1().pipe(
    mergeMap((tmdb) => f2(tmdb).pipe(map((yts) => merge(tmdb, yts)))),
    toArray()
  );

//merge TMDB movie and YTS movie into Movie type

const merge = (tmdb, yts) => {
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

module.exports = { searchMovies, getMovieGroup, getRecommended, getSimilar };
