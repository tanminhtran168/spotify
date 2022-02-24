import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import { get_homepage, get_song_manage, get_album_manage, get_artist_manage, get_single_song, get_single_artist, get_single_album, get_update_song, get_add_album, get_add_artist, get_add_song, get_update_album, get_update_artist} from '../controllers/adminController.js';
import ExpressFormidable from 'express-formidable';
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/',isAuth, checkAdmin, get_homepage);

router.get('/song/manage',isAuth, checkAdmin, get_song_manage);
router.get('/album/manage',isAuth, checkAdmin, get_album_manage);
router.get('/artist/manage',isAuth, checkAdmin, get_artist_manage);

router.get('/song/:songId/update', isAuth, checkAdmin,get_update_song);
router.get('/album/:albumId/update',isAuth, checkAdmin, get_update_album);
router.get('/artist/:artistId/update',isAuth, checkAdmin, get_update_artist);

router.get('/album/add', isAuth, checkAdmin,get_add_album);
router.get('/artist/add',isAuth, checkAdmin, get_add_artist);
router.get('/song/add',isAuth, checkAdmin, get_add_song);

router.get('/song/:songId',isAuth, checkAdmin, get_single_song);
router.get('/artist/:artistId',isAuth, checkAdmin, get_single_artist);
router.get('/album/:albumId', isAuth, checkAdmin,get_single_album);
export default router;