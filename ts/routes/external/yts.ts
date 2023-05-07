import http from "axios";
import { from, Observable } from "rxjs";
import { catchError, filter, map, mergeMap, switchMap } from "rxjs/operators";
import { YTS_BASE_URL } from "../../other/other";

// type definitions
type YTSMovie = {
  id: number;
  imdb_code: string;
  description_full: string;
  genres: string[];
  language: string;
  mpa_rating: string;
  rating: number;
  runtime: number;
  title_english: string;
  year: number;
  yt_trailer_code: string;
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

type YTSResponse = {
  data: { data: { movies: YTSMovie[] } & { movie: YTSMovie } };
};

type YTSMovieWrapper = {
  data: YTSMovie;
  index: number;
  isLast: boolean;
};

type AsyncYTSMovie = Observable<YTSMovieWrapper>;

//makes request to YTS API and map to movies Array using type()
function httpGet(apiPath: string): Observable<YTSMovie[]> {
  const url = YTS_BASE_URL + apiPath;
  return from(http.get(url)).pipe(
    map(type),
    catchError(() => [])
  );
}

const type = ({
  data: {
    data: { movie, movies },
  },
}: YTSResponse): YTSMovie[] => {
  if (movies) return movies;
  if (movie) return [movie];
  return [];
};

// api calls
const getById = (id: number): Observable<YTSMovie> =>
  httpGet(`movie_details.jsonp?movie_id=${id}&with_cast=true`).pipe(
    map(([movie]) => movie)
  );

const search = (term: string): Observable<YTSMovie> =>
  httpGet(`list_movies.jsonp?query_term=${term}`).pipe(
    switchMap((arr) => arr),
    mergeMap(({ id }) => getById(id))
  );

const getMovieByIMDBId = (id: number): Observable<YTSMovie> =>
  httpGet(`movie_details.jsonp?imdb_id=${id}`).pipe(
    filter(([{ id }]) => !!id),
    switchMap(([{ id }]) => getById(id))
  );

export { search, getMovieByIMDBId, YTSMovie };
