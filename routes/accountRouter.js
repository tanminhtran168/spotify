import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import {getAllAccount, get_getAccountInfo, post_getAccountInfo, post_addNewAccount, get_addNewAccount, post_deleteAccount, get_deleteAccount, updateAccount} from '../controllers/accountController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', isAuth, checkAdmin,  getAllAccount);

router.get('/search', isAuth, checkAdmin, get_getAccountInfo); 
router.post('/search', isAuth, checkAdmin, post_getAccountInfo);

router.get('/add', isAuth, checkAdmin, get_addNewAccount);
router.post('/add', isAuth, checkAdmin, post_addNewAccount);

router.get('/delete', isAuth, checkAdmin, get_deleteAccount);
router.post('/delete', isAuth, checkAdmin, post_deleteAccount);

router.put('/id/:id/', updateAccount);

export default router;