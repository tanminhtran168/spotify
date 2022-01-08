import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import {getSongRating, get_addNewRating, post_addNewRating, post_getAllRatingbyClient, post_getAllRatingbySong, get_deleteRating, post_deleteRating} from '../controllers/ratingController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/add', isAuth, get_addNewRating);
router.post('/add', isAuth, post_addNewRating);

router.get('/delete', isAuth, get_deleteRating);
router.post('/delete', isAuth, post_deleteRating);

export default router;