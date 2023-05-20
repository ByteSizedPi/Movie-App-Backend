const router = require("express").Router();

const {
  searchMovies,
  getMovieGroup,
  getRecommended,
  getSimilar,
} = require("./movies");

const http = require("axios");
const { from, toArray } = require("rxjs");

const sendMovies = (obs, res) =>
  obs.subscribe(
    (movies) => res.send(movies),
    (err) => res.send([])
  );

router.get("/search=:search", (req, res) =>
  sendMovies(searchMovies(req.params.search), res)
);

router.get("/group=:group", (req, res) =>
  sendMovies(getMovieGroup(req.params.group), res)
);

router.get("/recommended=:tmdb_id", (req, res) =>
  sendMovies(getRecommended(+req.params.tmdb_id), res)
);

router.get("/similar=:tmdb_id", (req, res) =>
  sendMovies(getSimilar(+req.params.tmdb_id), res)
);

module.exports = router;
