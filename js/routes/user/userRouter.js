const router = require("express").Router();
const User = require("../../models/user");
const { Try } = require("../../other/other");
const { authRequest } = require("../../other/auth");
const { isValidNewUser } = require("./user");

router.get("", authRequest, async (req, res) => {
  res.send(await User.findOne({ username: res.authToken.user }));
});

//list
router.get("/list", authRequest, async (req, res) => {
  Try(res, async () => {
    const { shows_list } = await User.findOne(
      { username: res.authToken.user },
      { shows_list: 1 }
    );
    return shows_list;
  });
});

router.get("/list_ids", authRequest, async (req, res) => {
  Try(res, async () => {
    const { shows_list } = await User.findOne(
      { username: res.authToken.user },
      { shows_list: { imdb_id: 1 } }
    );
    return shows_list.map(({ imdb_id }) => imdb_id);
  });
});

router.post("/list", authRequest, async (req, res) => {
  Try(res, async () => {
    if (!req.body.show) return res.status(400).json("movie missing");

    await User.updateOne(
      { username: res.authToken.user },
      { $addToSet: { shows_list: req.body.show } }
    );
    return { message: "list updated successfully" };
  });
});

router.delete("/list/imdbid=:imdbid", authRequest, async (req, res) => {
  Try(res, async () => {
    if (!req.params.imdbid) return res.status(400).json("id missing");

    await User.updateOne(
      { username: res.authToken.user },
      { $pull: { shows_list: { imdb_id: { $in: [req.params.imdbid] } } } }
    );

    return { message: "list updated successfully" };
  });
});

//user
router.post("/new", async (req, res) => {
  Try(res, async () => {
    if (!req.body.username || req.body.username.length < 6) {
      res
        .status(400)
        .send({ error: "username must be longer than 6 characters" });
      return;
    }
    if (!req.body.password || req.body.password.length < 6) {
      res
        .status(400)
        .send({ error: "password must be longer than 6 characters" });
      return;
    }
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      res.status(400).json({ error: "username is taken" });
      return;
    }
    await new User(req.body).save();
    return { message: "user created successfully" };
  });
});

module.exports = router;
