import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import { get_homepage, get_song_manage, get_album_manage, get_artist_manage, get_single_song, get_single_artist, get_single_album, get_update_song, get_add_album, get_add_artist, get_add_song, get_update_album, get_update_artist} from '../controllers/adminController.js';
import ExpressFormidable from 'express-formidable';
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', get_homepage);

router.get('/song/manage', get_song_manage);
router.get('/album/manage', get_album_manage);
router.get('/artist/manage', get_artist_manage);

router.get('/song/:songId/update', get_update_song);
router.get('/album/:albumId/update', get_update_album);
router.get('/artist/:artistId/update', get_update_artist);

router.get('/album/add', get_add_album);
router.get('/artist/add', get_add_artist);
router.get('/song/add', get_add_song);

router.get('/song/:songId', get_single_song);
router.get('/artist/:artistId', get_single_artist);
router.get('/album/:albumId', get_single_album);
export default router;