import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import { get_homepage, get_song_manage, get_single_song, get_update_song} from '../controllers/adminController.js';
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', get_homepage);

router.get('/manage/song/', get_song_manage);
router.get('/song/:songId', get_single_song);
router.get('/song/:songId/update', get_update_song);

export default router;