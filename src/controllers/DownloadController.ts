import { Request, Response } from 'express';
import WebTorrent from 'webtorrent';
import { TryCatch } from '../models/Models';

const client = new WebTorrent();

const buildMagnetURI = (infoHash: string) =>
	`magnet:?xt=urn:btih:${infoHash}&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.internetwarriors.net:1337&tr=wss://tracker.openwebtorrent.com`;

const findMP4_MKV = (torrent: WebTorrent.Torrent): WebTorrent.TorrentFile =>
	torrent.files.find(
		({ name }) => name.endsWith('.mp4') || name.endsWith('.mkv')
	) as WebTorrent.TorrentFile;

export class DownloadController {
	@TryCatch()
	static addInfoHash({ params: { infoHash } }: Request, res: Response) {
		return new Promise((resolve, reject) => {
			const torrent = buildMagnetURI(infoHash);

			if (client.get(torrent)) {
				console.log(`Existing torrent: ${infoHash}. Requested`);
				return resolve(infoHash);
			}

			client.add(torrent, () => {
				console.log('download added for hash: ', infoHash);
				resolve(infoHash);
			});
		});
	}

	@TryCatch()
	static async download({ params: { infoHash } }: Request, res: Response) {
		const torrent = client.get(infoHash);
		if (!torrent) return res.status(404).send({ msg: 'Hash not found!' });

		const file = findMP4_MKV(torrent);

		res.writeHead(200, {
			'Content-Length': file.length,
			'Content-Type': 'video/mp4',
		});

		console.log('sending file');

		file.createReadStream().pipe(res);

		res.on('close', () => console.log('download ended'));
	}
}
