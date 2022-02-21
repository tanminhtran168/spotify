import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, countViews, isAuth } from '../utils.js'
import {getAllArtist,getAllArtistFavorite, get_addArtistFavorite, post_addArtistFavorite, get_deleteArtistFavorite, post_deleteArtistFavorite, get_getArtistInfobyId, post_getArtistInfobyId, get_searchArtist, post_searchArtist, get_addNewArtist, post_addNewArtist, get_deleteArtist, post_deleteArtist, get_updateArtist, post_updateArtist} from '../controllers/artistController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/:artistId', countViews, post_getArtistInfobyId);

router.get('/get', countViews, get_getArtistInfobyId); 
router.post('/get', countViews, post_getArtistInfobyId);

router.get('/search', countViews, get_searchArtist); 
router.post('/search', countViews, post_searchArtist);

router.get('/add', isAuth, checkAdmin, get_addNewArtist);
router.post('/add', isAuth, checkAdmin, post_addNewArtist);

router.get('/delete', isAuth, checkAdmin, get_deleteArtist);
router.post('/delete', isAuth, checkAdmin, post_deleteArtist);

router.get('/update', isAuth, checkAdmin, get_updateArtist);
router.post('/update', isAuth, checkAdmin, post_updateArtist);

router.get('/getfavor', isAuth, countViews, getAllArtistFavorite);

router.get('/addfavor', isAuth, countViews, get_addArtistFavorite);
router.post('/addfavor', isAuth, countViews, post_addArtistFavorite);

router.get('/deletefavor', isAuth, countViews, get_deleteArtistFavorite);
router.post('/deletefavor', isAuth, countViews, post_deleteArtistFavorite);

export default router;