import { Request, Response } from 'express';

import { map } from 'rxjs';
import WebTorrent from 'webtorrent';
import { TorrentService as T } from '../models/Torrent';

export namespace DownloadController {
	export function stream(req: Request, res: Response) {
		const client = new WebTorrent();
		let clientActive: boolean = true;

		function destroyClient(msg: string) {
			return () => {
				console.log(msg);
				if (clientActive) {
					client.destroy();
					clientActive = false;
				}
			};
		}

		T.torrentToFile(req.params.infoHash, client)
			.pipe(
				map((file) => {
					res.writeHead(206, {
						'Accept-Ranges': 'bytes',
						'Content-Length': file.length,
						'Content-Type': 'video/mp4',
					});
					try {
						const stream = file.createReadStream();
						stream.pipe(res);
						res.on('close', destroyClient('download completed'));
						stream.on('error', destroyClient('stream error'));
					} catch (error) {
						destroyClient(error as string)();
					}
					return;
				})
			)
			.subscribe();
	}
}
