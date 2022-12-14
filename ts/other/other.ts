import http from "axios";
import { from, Observable, of, map, catchError, tap } from "rxjs";
import { Movie } from "../routes/external/movies";

const API_KEY = process.env.API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3/";
const YTS_BASE_URL = "https://yts.torrentbay.to/api/v2/";
const IMG_URL = "https://image.tmdb.org/t/p/";
const posterSizes = ["w92", "w154", "w185", "w342", "w500", "w780", "original"];
const backdrop_sizes = ["w300", "w780", "w1280", "original"];

export {
  API_KEY,
  TMDB_BASE_URL,
  YTS_BASE_URL,
  IMG_URL,
  posterSizes,
  backdrop_sizes,
};

export const fetch = <T>(url: string): Observable<T> => {
  try {
    return from(<Promise<T>>http.get(url));
  } catch (err) {
    return of();
  }
};
