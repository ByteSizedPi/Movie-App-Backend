var webtorrent = require("webtorrent");
const client = new webtorrent();

const buildMagnetURI = (infoHash) =>
  "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent";

const addInfoHash = (infoHash, res) => {
  if (!infoHash) {
    res.status(400).send("Missing infoHash parameter!");
    return;
  }

  const torrent = buildMagnetURI(infoHash);

  if (client.get(torrent)) client.remove(torrent);

  try {
    client.add(torrent, () => {
      console.log(infoHash + "added successfully!");
      res.status(201).send({ msg: "Hash added successfully!" });
    });
  } catch (err) {
    res.status(500).send("Error: " + err.toString());
  }
};

const stream = ({ params: { infoHash }, headers: { range } }, res) => {
  if (!infoHash) {
    res.status(400).send("Missing infoHash parameter!");
    return;
  }

  // try {
  const torrent = client.get(buildMagnetURI(infoHash));
  var file = torrent.files.find(({ name }) => name.endsWith(".mp4"));
  var total = file.length;

  if (typeof range != "undefined") {
    var parts = range.replace(/bytes=/, "").split("-");
    var partialstart = parts[0];
    var partialend = parts[1];
    var start = parseInt(partialstart, 10);
    var end = partialend ? parseInt(partialend, 10) : total - 1;
    var chunksize = end - start + 1;
  } else {
    var start = 0;
    var end = total;
  }

  var stream = file.createReadStream({ start: start, end: end });

  res.writeHead(206, {
    "Content-Range": "bytes " + start + "-" + end + "/" + total,
    "Accept-Ranges": "bytes",
    "Content-Length": chunksize,
    "Content-Type": "video/mp4",
  });
  console.log("stream ready");
  stream.pipe(res);
  // } catch (err) {
  //   res.status(500).send("Error: " + err.toString());
  // }
};

module.exports = { addInfoHash, stream };
