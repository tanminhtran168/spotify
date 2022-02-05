import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import {get_Signup, post_Signup, get_Login, post_Login, loginAdmin, get_logout, post_logout, searchQuery, get_dashboard, post_queue, get_queue} from '../controllers/userController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', get_dashboard);
router.get('/signup', get_Signup);
router.post('/signup', post_Signup);

router.get('/login', get_Login);
router.post('/login', post_Login);

router.get('/logout', isAuth, get_logout)
router.post('/logout', isAuth, post_logout)

router.get('/check', isAuth, checkAdmin, loginAdmin);

router.post('/queue', post_queue);
router.get('/queue', get_queue);
router.get('/search/:keyword', searchQuery)
export default router;