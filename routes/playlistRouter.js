import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import {getAllPlaylist, get_getPlaylistbyId, post_getPlaylistbyId, get_addNewPlaylist, post_addNewPlaylist, get_deletePlaylist, post_deletePlaylist, get_getAllSonginPlaylist, post_getAllSonginPlaylist, get_addNewSongToPlaylist, post_addNewSongToPlaylist, get_deleteSongInPlaylist, post_deleteSongInPlaylist, get_updatePlaylist, post_updatePlaylist} from '../controllers/playlistController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', isAuth, getAllPlaylist);

router.get('/get/', isAuth, get_getPlaylistbyId); 
router.post('/get/', isAuth, post_getPlaylistbyId);

router.get('/add/', isAuth, get_addNewPlaylist);
router.post('/add/', isAuth, post_addNewPlaylist);

router.get('/delete/', isAuth, get_deletePlaylist);
router.post('/delete/', isAuth, post_deletePlaylist);

router.get('/update/', isAuth, get_updatePlaylist);
router.post('/update/', isAuth, post_updatePlaylist);

router.get('/song/', isAuth, get_getAllSonginPlaylist);
router.post('/song/', isAuth, post_getAllSonginPlaylist);

router.get('/song/add/', isAuth, get_addNewSongToPlaylist);
router.post('/song/add/', isAuth, post_addNewSongToPlaylist);

router.get('/song/delete/', isAuth, get_deleteSongInPlaylist);
router.post('/song/delete/', isAuth, post_deleteSongInPlaylist);


export default router;