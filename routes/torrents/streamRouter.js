const router = require("express").Router();
const { addInfoHash, stream } = require("./stream");

router.get("/add/:infoHash", (req, res) =>
  addInfoHash(req.params.infoHash, res)
);

router.get("/stream/:infoHash", (req, res) => stream(req, res));

module.exports = router;
