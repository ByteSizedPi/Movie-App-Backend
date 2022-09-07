const router = require("express").Router();
const User = require("../../models/user");
const { authRequest } = require("../../other/auth");
const { getUserByBody, isValidNewUser, pushList } = require("./user");

router.get("", authRequest, async (req, res) => {
  res.send(await User.find({ username: res.authToken.user }));
});

router.get("/list", authRequest, async (req, res) => {
  try {
    //query for list
    const [{ shows_list }] = await User.find(
      { username: res.authToken.user },
      { shows_list: 1 }
    );

    //return list
    res.send(shows_list);
  } catch ({ message }) {
    res.status(500).send({ error: message });
  }
});

router.get("/list_ids", authRequest, async (req, res) => {
  try {
    //query for list
    const [{ shows_list }] = await User.find(
      { username: res.authToken.user },
      { shows_list: { imdb_id: 1 } }
    );

    //return list
    res.send(shows_list.map(({ imdb_id }) => imdb_id));
  } catch ({ message }) {
    res.status(500).send({ error: message });
  }
});

router.post("/list", authRequest, async (req, res) => {
  try {
    if (!req.body.show) return res.status(400).json("movie missing");

    await User.updateOne(
      { username: res.authToken.user },
      { $addToSet: { shows_list: req.body.show } }
    );
    res.json({ message: "list updated successfully" });
  } catch ({ message }) {
    res.status(500).send({ error: message });
  }
});

router.delete("/list/imdbid=:imdbid", authRequest, async (req, res) => {
  try {
    if (!req.params.imdbid) return res.status(400).json("id missing");

    await User.updateOne(
      { username: res.authToken.user },
      { $pull: { shows_list: { imdb_id: { $in: [req.params.imdbid] } } } }
    );

    res.json({ message: "list updated successfully" });
  } catch ({ message }) {
    res.status(500).send({ error: message });
  }
});

router.post("/new", [getUserByBody, isValidNewUser], async (req, res) => {
  new User(req.body)
    .save()
    .then((_) => res.status(201).send({ message: "user created successfully" }))
    .catch((err) => res.status(400).send({ error: err.message }));
});

module.exports = router;
