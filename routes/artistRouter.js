import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import {getAllArtist, get_getArtistInfo, post_getArtistInfo, get_addNewArtist, post_addNewArtist, get_deleteArtist, post_deleteArtist, updateArtist} from '../controllers/artistController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', isAuth, getAllArtist);

router.get('/search', isAuth, get_getArtistInfo); 
router.post('/search', isAuth, post_getArtistInfo);

router.get('/add', isAuth, checkAdmin, get_addNewArtist);
router.post('/add', isAuth, checkAdmin, post_addNewArtist);

router.get('/delete', isAuth, checkAdmin, get_deleteArtist);
router.post('/delete', isAuth, checkAdmin, post_deleteArtist);

//router.put('/id/:id/', updateArtist);

export default router;