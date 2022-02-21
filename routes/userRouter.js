import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, countViews, isAuth } from '../utils.js'
import {get_countViews, get_Signup, post_Signup, get_Login, post_Login, loginAdmin, get_logout, post_logout, searchQuery, get_dashboard, post_queue, get_queue} from '../controllers/userController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', countViews, get_dashboard);
router.get('/signup', countViews, get_Signup);
router.post('/signup', countViews, post_Signup);

router.get('/login', countViews, get_Login);
router.post('/login', countViews, post_Login);

router.get('/logout', isAuth, countViews, get_logout)
router.post('/logout', isAuth, countViews, post_logout)

router.get('/check', isAuth, checkAdmin, loginAdmin);

router.post('/queue', countViews, post_queue);
router.get('/queue', countViews, get_queue);
router.get('/search/:keyword', countViews, searchQuery)
router.get('/views', get_countViews)
export default router;