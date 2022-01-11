import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import {getAllArtist, get_getArtistInfobyId, post_getArtistInfobyId, get_searchArtist, post_searchArtist, get_addNewArtist, post_addNewArtist, get_deleteArtist, post_deleteArtist, get_updateArtist, post_updateArtist} from '../controllers/artistController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', isAuth, getAllArtist);

router.get('/get', isAuth, get_getArtistInfobyId); 
router.post('/get', isAuth, post_getArtistInfobyId);

router.get('/search', isAuth, get_searchArtist); 
router.post('/search', isAuth, post_searchArtist);

router.get('/add', isAuth, checkAdmin, get_addNewArtist);
router.post('/add', isAuth, checkAdmin, post_addNewArtist);

router.get('/delete', isAuth, checkAdmin, get_deleteArtist);
router.post('/delete', isAuth, checkAdmin, post_deleteArtist);

router.get('/update', isAuth, checkAdmin, get_updateArtist);
router.post('/update', isAuth, checkAdmin, post_updateArtist);

export default router;