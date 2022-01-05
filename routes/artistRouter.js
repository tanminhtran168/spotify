import express from 'express'
import bodyParser from 'body-parser';
import {getAllArtist, get_getArtistInfo, post_getArtistInfo, get_addNewArtist, post_addNewArtist, get_deleteArtist, post_deleteArtist, updateArtist} from '../controllers/artistController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/',  getAllArtist);

router.get('/search',  get_getArtistInfo); 
router.post('/search',  post_getArtistInfo);

router.get('/add', get_addNewArtist);
router.post('/add', post_addNewArtist);

router.get('/delete', get_deleteArtist);
router.post('/delete', post_deleteArtist);

router.put('/id/:id/', updateArtist);

export default router;