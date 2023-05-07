import { Request, Response, Router } from "express";
import NodeCache from "node-cache";
import { Observable } from "rxjs";
import {
  getMovieGroup,
  getRecommended,
  getSimilar,
  Movie,
  searchMovies,
} from "./movies";

const router = Router();
const cache = new NodeCache({ stdTTL: 60 * 200, checkperiod: 60 * 200 });

const sendMovies = (
  obs: Observable<Movie[]>,
  req: Request,
  res: Response<Movie[]>
) => {
  const cached = cache.has(req.url);
  if (cached) return res.send(cache.get(req.url));

  obs.subscribe(
    (movies) => {
      cache.set(req.url, movies);
      res.send(movies);
    },
    (err) => res.send([])
  );
};

router.get("/search=:search", (req, res) =>
  sendMovies(searchMovies(req.params.search), req, res)
);

router.get("/group=:group", (req, res) =>
  sendMovies(getMovieGroup(req.params.group), req, res)
);

router.get("/recommended=:tmdb_id", (req, res) =>
  sendMovies(getRecommended(+req.params.tmdb_id), req, res)
);

router.get("/similar=:tmdb_id", (req, res) =>
  sendMovies(getSimilar(+req.params.tmdb_id), req, res)
);

export { router as moviesRouter };
