import { Router } from 'express';
import { StreamController } from '../controllers/StreamController';
const router = Router();

router.get('/add/:infoHash', StreamController.addInfoHash);
router.get('/:infoHash', StreamController.stream);
export { router as streamRouter };
