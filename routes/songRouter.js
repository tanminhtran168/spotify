import express from 'express'
import bodyParser from 'body-parser';
import {getAllSong, get_getSongInfo, post_getSongInfo, get_addNewSong, post_addNewSong, get_deleteSong, post_deleteSong, updateSong} from '../controllers/songController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/',  getAllSong);

router.get('/search/',  get_getSongInfo); 
router.post('/search/',  post_getSongInfo);

router.get('/add/', get_addNewSong);
router.post('/add/', post_addNewSong);

router.get('/delete/', get_deleteSong);
router.post('/delete/', post_deleteSong);

router.put('/:id/', updateSong);

export default router;