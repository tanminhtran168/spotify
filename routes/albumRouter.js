import express from 'express'
import bodyParser from 'body-parser';
import {getAllAlbum, getAlbumInfo, addNewAlbum, deleteAlbum, updateAlbum} from '../controllers/albumController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/',  getAllAlbum);

router.get('/:id/',  getAlbumInfo); 

router.get('/:id/', addNewAlbum);

router.delete('/:id/', deleteAlbum);

router.put('/:id/', updateAlbum);

export default router;