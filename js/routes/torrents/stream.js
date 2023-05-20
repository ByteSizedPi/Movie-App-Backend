var webtorrent = require("webtorrent");
const client = new webtorrent();

let STREAM;

const buildMagnetURI = (infoHash) =>
  "magnet:?xt=urn:btih:" +
  infoHash +
  "&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.internetwarriors.net:1337&tr=wss://tracker.openwebtorrent.com";

const addInfoHash = (infoHash, res) => {
  if (!infoHash) {
    res.status(400).send("Missing infoHash parameter!");
    return;
  }

  const torrent = buildMagnetURI(infoHash);

  if (client.get(torrent)) client.remove(torrent);

  try {
    client.add(torrent, () => {
      console.log(infoHash + " added successfully!");
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
  const torrent = client.get(infoHash);
  if (!torrent) {
    res.status(400).json({ error: "torrent could not be added" });
    return;
  }
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

  var STREAM = file.createReadStream({ start: start, end: end });

  res.writeHead(206, {
    "Content-Range": "bytes " + start + "-" + end + "/" + total,
    "Accept-Ranges": "bytes",
    "Content-Length": chunksize,
    "Content-Type": "video/mp4",
  });
  console.log("stream ready");
  STREAM.pipe(res);
  STREAM.on("close", () => console.log("stream ended"));
  // } catch (err) {
  //   res.status(500).send("Error: " + err.toString());
  // }
};

module.exports = { addInfoHash, stream };
