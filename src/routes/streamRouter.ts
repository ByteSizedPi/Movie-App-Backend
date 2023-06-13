import { Router } from 'express';
import { StreamController } from '../controllers/StreamController';
const router = Router();

router.get('/add/:infoHash', StreamController.addInfoHash);
router.get('/stream/:infoHash', StreamController.streamHash);
export { router as streamRouter };
