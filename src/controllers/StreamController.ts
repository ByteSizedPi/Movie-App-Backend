import { Request, Response } from 'express';
import WebTorrent from 'webtorrent';

const client = new WebTorrent();

const buildMagnetURI = (infoHash: string) =>
	`magnet:?xt=urn:btih:${infoHash}&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.internetwarriors.net:1337&tr=wss://tracker.openwebtorrent.com`;

export class StreamController {
	static addInfoHash({ params: { infoHash } }: Request, res: Response) {
		const torrent = buildMagnetURI(infoHash);

		try {
			if (client.get(torrent)) {
				console.log(`Existing torrent: ${torrent}. Requested`);
				return res.status(201).send({ msg: 'Existing hash!' });
			}

			client.add(torrent, () => {
				console.log('torrent added');
				res.status(201).send({ msg: 'Hash added successfully!' });
			});
		} catch ({ message }: any) {
			res.status(500).send({ error: message });
		}
	}

	static streamHash(
		{ params: { infoHash }, headers: { range } }: Request,
		res: Response
	) {
		const torrent = client.get(infoHash);

		if (!torrent)
			return res.status(400).json({ error: 'torrent could not be added' });

		// find the mp4 file
		const file: WebTorrent.TorrentFile = torrent.files.find(({ name }) =>
			name.endsWith('.mp4')
		) as WebTorrent.TorrentFile;

		const length = file.length;

		if (range) {
			const parts = range.replace(/bytes=/, '').split('-');
			const start = parseInt(parts[0], 10);
			const end = parts[1] ? parseInt(parts[1], 10) : length - 1;
			const chunkSize = end - start + 1;
			const head = {
				'Content-Range': `bytes ${start}-${end}/${length}`,
				'Accept-Ranges': 'bytes',
				'Content-Length': chunkSize,
				'Content-Type': 'video/mp4',
			};
			const stream = file.createReadStream({ start, end });
			res.writeHead(206, head);
			stream.pipe(res);
		} else {
			const head = {
				'Content-Length': length,
				'Content-Type': 'video/mp4',
			};
			res.writeHead(200, head);
			file.createReadStream().pipe(res);
		}

		res.on('close', () => console.log('stream ended'));
	}
}
