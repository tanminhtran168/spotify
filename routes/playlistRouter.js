import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import {getAllPlaylist, get_getPlaylistInfo, post_getPlaylistInfo, addNewPlaylist, deletePlaylist, updatePlaylist} from '../controllers/playlistController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/',  getAllPlaylist);

router.get('/search/',  get_getPlaylistInfo); 
router.post('/search/',  post_getPlaylistInfo);

router.get('/:id/', addNewPlaylist);

router.delete('/:id/', deletePlaylist);

router.put('/:id/', updatePlaylist);

export default router;