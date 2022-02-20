import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, countViews, isAuth } from '../utils.js'
import {get_getCommentInfo, post_getCommentInfo, get_deleteComment, get_editComment, get_addNewComment, post_addNewComment, post_editComment, post_deleteComment, getAllCommentbyClient, get_getAllCommentofSong, post_getAllCommentofSong} from '../controllers/commentController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/mine', isAuth, countViews, getAllCommentbyClient);

router.get('/getinfo', countViews, get_getCommentInfo);
router.post('/getinfo', countViews, post_getCommentInfo);

router.get('/get', countViews, get_getAllCommentofSong);
router.post('/get', countViews, post_getAllCommentofSong);

router.get('/add', isAuth, countViews, get_addNewComment);
router.post('/add', isAuth, countViews, post_addNewComment);

router.get('/delete', isAuth, countViews, get_deleteComment);
router.post('/delete', isAuth, countViews, post_deleteComment);

router.get('/edit', isAuth, countViews, get_editComment);
router.post('/edit', isAuth, countViews, post_editComment);

export default router;