import { Request, Response } from 'express';
import WebTorrent from 'webtorrent';
import { TryCatch } from '../models/Models';

const client = new WebTorrent();

const buildMagnetURI = (infoHash: string) =>
	`magnet:?xt=urn:btih:${infoHash}&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.internetwarriors.net:1337&tr=wss://tracker.openwebtorrent.com`;

const findMP4 = (torrent: WebTorrent.Torrent): WebTorrent.TorrentFile =>
	torrent.files.find(({ name }) =>
		name.endsWith('.mp4')
	) as WebTorrent.TorrentFile;

export class StreamController {
	@TryCatch()
	static addInfoHash({ params: { infoHash } }: Request, res: Response) {
		const torrent = buildMagnetURI(infoHash);

		if (client.get(torrent)) {
			console.log(`Existing torrent: ${torrent}. Requested`);
			return res.status(201).send({ msg: 'Existing hash!' });
		}

		client.add(torrent, () => {
			console.log('torrent added');
			return res.status(201).send({ msg: 'Hash added successfully!' });
		});
	}

	private static findMP4(torrent: WebTorrent.Torrent): WebTorrent.TorrentFile {
		return torrent.files.find(({ name }) =>
			name.endsWith('.mp4')
		) as WebTorrent.TorrentFile;
	}

	@TryCatch()
	static async stream({ params: { infoHash } }: Request, res: Response) {
		const torrent = client.get(infoHash);
		if (!torrent) return res.status(404).send({ msg: 'Hash not found!' });

		const file = findMP4(torrent);

		res.writeHead(200, {
			'Content-Length': file.length,
			'Content-Type': 'video/mp4',
		});
		file.createReadStream().pipe(res);

		res.on('close', () => console.log('stream ended'));
	}
}
