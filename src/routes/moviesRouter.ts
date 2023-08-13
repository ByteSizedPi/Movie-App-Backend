import { Router } from 'express';

import { DownloadController } from '../controllers/DownloadController';
import { MovieController } from '../controllers/MovieController';

const router = Router();
// router.use(AuthController.authSession);

// router.get('/group=:group', MovieController.getMovieGroup);

router.get('/search=:query', MovieController.getSearch);
router.get('/group=:group', MovieController.getGroup);
router.get('/tmdbid=:tmdb_id', MovieController.getMovieByTMDBId);
// router.get('/download=:infoHash', DownloadController.download);
router.get('/stream=:infoHash', DownloadController.stream);
router.get('/recommended=:tmdb_id', MovieController.getRecommended);
router.get('/similar=:tmdb_id', MovieController.getSimilar);

export { router as moviesRouter };
