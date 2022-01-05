import express from 'express'
import bodyParser from 'body-parser';
import {get_Signup, post_Signup, get_Login, post_Login} from '../controllers/userController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/signup', get_Signup);

router.post('/signup', post_Signup);

router.get('/login', get_Login);

router.post('/login', post_Login);

export default router;