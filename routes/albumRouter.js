import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, countViews, isAuth } from '../utils.js'
import {getAllAlbum, get_searchAlbum, post_searchAlbum, get_getAlbumbyId, post_getAlbumbyId, get_addNewAlbum, post_addNewAlbum, get_deleteAlbum, post_deleteAlbum, get_updateAlbum, post_updateAlbum} from '../controllers/albumController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/:albumId', countViews, post_getAlbumbyId);

router.get('/get', countViews, get_getAlbumbyId); 
router.post('/get', countViews, post_getAlbumbyId);

router.get('/search', countViews, get_searchAlbum); 
router.post('/search', countViews, post_searchAlbum);

router.get('/add', isAuth, checkAdmin, get_addNewAlbum);
router.post('/add', isAuth, checkAdmin, post_addNewAlbum);

router.get('/delete', isAuth, checkAdmin, get_deleteAlbum);
router.post('/delete', isAuth, checkAdmin, post_deleteAlbum);

router.get('/update', isAuth, checkAdmin, get_updateAlbum);
router.post('/update', isAuth, checkAdmin, post_updateAlbum);

export default router;