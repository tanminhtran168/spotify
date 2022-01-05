import express from 'express'
import bodyParser from 'body-parser';
import {getAllSong, get_getSongInfo, post_getSongInfo, addNewSong, deleteSong, updateSong} from '../controllers/songController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/',  getAllSong);

router.get('/search/',  get_getSongInfo); 
router.post('/search/',  post_getSongInfo);

router.get('/:id/', addNewSong);

router.delete('/:id/', deleteSong);

router.put('/:id/', updateSong);

export default router;