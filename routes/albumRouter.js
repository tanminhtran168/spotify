import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import {getAllAlbum, get_getAlbumInfo, post_getAlbumInfo, get_addNewAlbum, post_addNewAlbum, get_deleteAlbum, post_deleteAlbum, updateAlbum} from '../controllers/albumController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', getAllAlbum);

router.get('/search', isAuth, get_getAlbumInfo); 
router.post('/search', isAuth, post_getAlbumInfo);

router.get('/add', isAuth, checkAdmin, get_addNewAlbum);
router.post('/add', isAuth, checkAdmin, post_addNewAlbum);

router.get('/delete', isAuth, checkAdmin, get_deleteAlbum);
router.post('/delete', isAuth, checkAdmin, post_deleteAlbum);

//router.put('/id/:id/', updateAlbum);

export default router;