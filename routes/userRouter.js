import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import {get_Signup, post_Signup, get_Login, post_Login, loginAdmin} from '../controllers/userController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/signup', get_Signup);

router.post('/signup', post_Signup);

router.get('/login', get_Login);

router.post('/login', post_Login);

router.get('/check', isAuth, checkAdmin, loginAdmin);

export default router;