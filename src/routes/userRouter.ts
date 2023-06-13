import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserController } from '../controllers/UserController';

const router = Router();

// no auth needed

router.post('/register', UserController.register);

router.post('/login', [
	AuthController.usernameExists,
	AuthController.verifyPassword,
	AuthController.setAuthCookie,
]);

router.get('/verifyUsername/:username', AuthController.softVeryfyUsername);

// auth needed

router.use(AuthController.authSession);

router.get('/list', UserController.getUserList);
router.get('/listids', UserController.getUserListIDs);

router.post('/logout', AuthController.logout);
router.post('/list', UserController.postUserList);

router.delete('/list/imdbid=:imdb_id', UserController.deleteShowByID);

export { router as userRouter };
