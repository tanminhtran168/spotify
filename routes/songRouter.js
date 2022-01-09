import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import {getAllSong, get_getSongInfo, post_getSongInfo, get_addNewSong, post_addNewSong, get_deleteSong, post_deleteSong, updateSong} from '../controllers/songController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', getAllSong);

router.get('/search/', get_getSongInfo); 
router.post('/search/', post_getSongInfo);

router.get('/add/', isAuth, checkAdmin, get_addNewSong);
router.post('/add/', isAuth, checkAdmin, post_addNewSong);

router.get('/delete/', isAuth, checkAdmin, get_deleteSong);
router.post('/delete/', isAuth, checkAdmin, post_deleteSong);

//router.put('/:id/', updateSong);

export default router;