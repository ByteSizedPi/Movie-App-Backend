import * as Log from "../../other/logs";
import * as TMDB from "./tmdb";
import * as YTS from "./yts";

import { Observable } from "rxjs";
import { finalize, map, mergeMap, tap, toArray } from "rxjs/operators";

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

export type Movie = {
  yts_id: number;
  tmdb_id: number;
  imdb_id: string;

  budget: number;
  description_full: string;
  genres: string[];
  language: string;
  mpa_rating: string;
  providers: {
    logo_path: string;
    provider_name: string;
  }[];
  rating: number;
  revenue: number;
  reviews: Review[];
  runtime: number;
  summary: string;
  title: string;
  year: number;
  yt_trailer: string;

  poster: string;
  backdrop: string;

  cast: {
    name: string;
    character_name: string;
    url_small_image?: string;
    imdb_code: string;
  }[];

  torrents: {
    url: string;
    hash: string;
    quality: string;
    type: string;
    seeds: number;
    peers: number;
    size: string;
    size_bytes: number;
    date_uploaded: string;
    date_uploaded_unix: number;
  }[];
};

type TMDBFunc = (param?: any) => Observable<TMDB.TMDBMovie>;
type YTSFunc = (param?: any) => Observable<YTS.YTSMovie>;

const searchMovies = (query: string): Observable<Movie[]> =>
  getYTS_TMDB(
    () => YTS.search(query),
    ({ imdb_code }) => TMDB.getMovieByIMDBId(imdb_code)
  );

//Different movie group requests

const getMovieGroup = (group: string): Observable<Movie[]> =>
  YTSIMDB(() => TMDB.getMovieGroup(group));

const getRecommended = (tmdb_id: number): Observable<Movie[]> =>
  YTSIMDB(() => TMDB.getRecommended(tmdb_id));

const getSimilar = (tmdb_id: number): Observable<Movie[]> =>
  YTSIMDB(() => TMDB.getSimilar(tmdb_id));

//helper function where second function is to get movies from YTS by ID
const YTSIMDB = (f: TMDBFunc): Observable<Movie[]> =>
  getTMDB_YTS(f, ({ imdb_id }) => YTS.getMovieByIMDBId(imdb_id));

//query first api for movie/movies then get same movie from other api, return as array

const getYTS_TMDB = (f1: YTSFunc, f2: TMDBFunc): Observable<Movie[]> => {
  let ytsCount = 0;
  let tmdbCount = 0;
  let start = new Date().getTime();

  return f1().pipe(
    tap((_) => ++ytsCount),
    finalize(() => Log.yts(ytsCount, start)),
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

const getTMDB_YTS = (f1: TMDBFunc, f2: YTSFunc): Observable<Movie[]> => {
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

const merge = (tmdb: TMDB.TMDBMovie, yts: YTS.YTSMovie): Movie => {
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

export { searchMovies, getMovieGroup, getRecommended, getSimilar };
