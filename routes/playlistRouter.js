import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import {getAllPlaylist, get_getPlaylistInfo, post_getPlaylistInfo, get_addNewPlaylist, post_addNewPlaylist, get_deletePlaylist, post_deletePlaylist, updatePlaylist, getAllSonginPlaylist, getSongInfoinPlaylist, addNewSongToPlaylist, deleteSongInPlaylist} from '../controllers/playlistController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', isAuth, getAllPlaylist);

router.get('/search/', isAuth, get_getPlaylistInfo); 
router.post('/search/', isAuth, post_getPlaylistInfo);

router.get('/add/', isAuth, get_addNewPlaylist);
router.post('/add/', isAuth, post_addNewPlaylist);

router.get('/delete/', isAuth, get_deletePlaylist);
router.post('/delete/', isAuth, post_deletePlaylist);

router.put('/update/', isAuth, updatePlaylist);

router.get('/song/', isAuth, getAllSonginPlaylist);

router.post('/song/search/', isAuth, getSongInfoinPlaylist);

router.post('/song/add/', isAuth, addNewSongToPlaylist);

router.post('/song/delete/', isAuth, deleteSongInPlaylist);


export default router;