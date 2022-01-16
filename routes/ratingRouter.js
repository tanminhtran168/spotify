import express from 'express'
import bodyParser from 'body-parser';
import { isAuth } from '../utils.js'
import {getAllRating, getAllMyRating, get_getSongRating, post_getSongRating, get_getAllRatingofSong, post_getAllRatingofSong, get_addNewRating, post_addNewRating, get_deleteRating, post_deleteRating, get_getSongbyRating, post_getSongbyRating} from '../controllers/ratingController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', getAllRating)

router.get('/mine', isAuth, getAllMyRating)

router.get('/getallratingsofsong', get_getAllRatingofSong)
router.post('/getallratingsofsong', post_getAllRatingofSong)

router.get('/getratingofsong', get_getSongRating)
router.post('/getratingofsong', post_getSongRating)

router.get('/add', isAuth, get_addNewRating);
router.post('/add', isAuth, post_addNewRating);

router.get('/delete', isAuth, get_deleteRating);
router.post('/delete', isAuth, post_deleteRating);

router.get('/sort', get_getSongbyRating)
router.post('/sort', post_getSongbyRating)

export default router;