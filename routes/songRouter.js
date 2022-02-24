import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, countViews, isAuth } from '../utils.js'
import {getAllSong, get_getSongInfobyId, post_getSongInfobyId, get_searchSong, post_searchSong, get_addNewSong, post_addNewSong, get_deleteSong, post_deleteSong, get_updateSong, post_updateSong, addNewRecentlyListenedSong} from '../controllers/songController.js'
import ExpressFormidable from 'express-formidable';
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/get/', countViews, get_getSongInfobyId); 
router.post('/get/', countViews, get_getSongInfobyId);

router.get('/search/', countViews, get_searchSong); 
router.post('/search/', countViews, post_searchSong);

router.get('/add/', isAuth, checkAdmin, get_addNewSong);
router.post('/add/', isAuth, ExpressFormidable(), checkAdmin, post_addNewSong);

router.get('/delete/', isAuth, checkAdmin, get_deleteSong);
router.post('/delete/', isAuth, checkAdmin, post_deleteSong);

router.get('/update/', isAuth, checkAdmin, get_updateSong);
router.post('/update/', isAuth, checkAdmin, post_updateSong);

router.get('/:songId', countViews, post_getSongInfobyId);
router.post('/recent', addNewRecentlyListenedSong)
export default router;