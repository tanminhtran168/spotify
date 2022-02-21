import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, countViews, isAuth } from '../utils.js'
import {getAllPlaylist, get_getPlaylistbyId, post_getPlaylistbyId, get_addNewPlaylist, post_addNewPlaylist, get_deletePlaylist, post_deletePlaylist, get_getAllSonginPlaylist, post_getAllSonginPlaylist, get_addNewSongToPlaylist, post_addNewSongToPlaylist, get_deleteSongInPlaylist, post_deleteSongInPlaylist, get_updatePlaylist, post_updatePlaylist} from '../controllers/playlistController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', isAuth, countViews, getAllPlaylist);


router.post('/get/', isAuth, countViews, post_getPlaylistbyId);

router.get('/add/', isAuth, countViews, get_addNewPlaylist);
router.post('/add/', isAuth, countViews, post_addNewPlaylist);

router.get('/delete/', isAuth, countViews, get_deletePlaylist);
router.post('/delete/', isAuth, countViews, post_deletePlaylist);

router.get('/update/', isAuth, countViews, get_updatePlaylist);
router.post('/update/', isAuth, countViews, post_updatePlaylist);

router.get('/song/', isAuth, countViews, get_getAllSonginPlaylist);
router.post('/song/', isAuth, countViews, post_getAllSonginPlaylist);

router.get('/song/add/', isAuth, countViews, get_addNewSongToPlaylist);
router.post('/song/add/', isAuth, countViews, post_addNewSongToPlaylist);

router.get('/song/delete/', isAuth, countViews, get_deleteSongInPlaylist);
router.post('/song/delete/', isAuth, countViews, post_deleteSongInPlaylist);

router.get('/:playlistId', isAuth, countViews, get_getPlaylistbyId); 

export default router;