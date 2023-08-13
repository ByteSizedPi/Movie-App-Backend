import { Observable, map, of, switchMap } from 'rxjs';
import WebTorrent from 'webtorrent';

export namespace TorrentService {
	export function buildMagnetURI(infoHash: string): string {
		return `magnet:?xt=urn:btih:${infoHash}&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.internetwarriors.net:1337&tr=wss://tracker.openwebtorrent.com`;
	}

	export const findMP4_MKV = (
		torrent: WebTorrent.Torrent
	): WebTorrent.TorrentFile =>
		torrent.files.find(
			({ name }) => name.endsWith('.mp4') || name.endsWith('.mkv')
		) as WebTorrent.TorrentFile;

	export function get(
		infoHash: string,
		client: WebTorrent.Instance
	): Observable<WebTorrent.Torrent> {
		const torrent = client.get(infoHash);
		if (torrent) {
			console.log(`Existing torrent requested`);
			return of(torrent);
		} else {
			return new Observable((sub) => {
				client.add(infoHash, (torrent) => {
					console.log(`Download Added`);
					sub.next(torrent);
					sub.complete();
				});
			});
		}
	}

	export function torrentToFile(infoHash: string, client: WebTorrent.Instance) {
		return of(infoHash).pipe(
			map(TorrentService.buildMagnetURI),
			switchMap((uri) => TorrentService.get(uri, client)),
			map(TorrentService.findMP4_MKV)
		);
	}
}
