import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import {get_getCommentInfo, post_getCommentInfo, get_deleteComment, get_editComment, get_addNewComment, post_addNewComment, post_editComment, post_deleteComment, getAllCommentbyClient, get_getAllCommentofSong, post_getAllCommentofSong} from '../controllers/commentController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/mine', isAuth, getAllCommentbyClient);

router.get('/getinfo', get_getCommentInfo);
router.post('/getinfo', post_getCommentInfo);

router.get('/get', get_getAllCommentofSong);
router.post('/get', post_getAllCommentofSong);

router.get('/add', isAuth, get_addNewComment);
router.post('/add', isAuth, post_addNewComment);

router.get('/delete', isAuth, get_deleteComment);
router.post('/delete', isAuth, post_deleteComment);

router.get('/edit', isAuth, get_editComment);
router.post('/edit', isAuth, post_editComment);

export default router;