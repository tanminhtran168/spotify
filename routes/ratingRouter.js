import express from 'express'
import bodyParser from 'body-parser';
import { isAuth, countViews } from '../utils.js'
import {getAllRating, getAllMyRating, get_getSongRating, post_getSongRating, get_getAllRatingofSong, post_getAllRatingofSong, get_addNewRating, post_addNewRating, get_deleteRating, post_deleteRating, get_getSongbyRating, post_getSongbyRating} from '../controllers/ratingController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', getAllRating)

router.get('/mine', isAuth, getAllMyRating)

router.get('/getallratingsofsong', countViews, get_getAllRatingofSong)
router.post('/getallratingsofsong', countViews, post_getAllRatingofSong)

router.get('/getratingofsong', countViews, get_getSongRating)
router.post('/getratingofsong', countViews, post_getSongRating)

router.get('/add', isAuth, countViews, get_addNewRating);
router.post('/add', isAuth, countViews, post_addNewRating);

router.get('/delete', isAuth, countViews, get_deleteRating);
router.post('/delete', isAuth, countViews, post_deleteRating);

router.get('/sort', countViews, get_getSongbyRating)
router.post('/sort', countViews, post_getSongbyRating)

export default router;