import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import { get_homepage, getNumAlbum, getNumArtist, getNumSong, getNumClient} from '../controllers/adminController.js';
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', get_homepage);
router.get('/getsong', getNumSong)
router.get('/getalbum', getNumAlbum)
router.get('/getartist', getNumArtist)
router.get('/getclient', getNumClient)

export default router;