import express from 'express'
import bodyParser from 'body-parser';
import { checkAdmin, isAuth } from '../utils.js'
import {getAllAccount, get_getAccountInfobyId, post_getAccountInfobyId, get_searchAccount, post_searchAccount, post_addNewAccount, get_addNewAccount, post_deleteAccount, get_deleteAccount, get_updateAccount, post_updateAccount, getMyAccountInfo} from '../controllers/accountController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/', isAuth, checkAdmin,  getAllAccount);

router.get('/mine', isAuth,  getMyAccountInfo);

router.get('/get', isAuth, checkAdmin, get_getAccountInfobyId); 
router.post('/get', isAuth, checkAdmin, post_getAccountInfobyId);

router.get('/search', isAuth, checkAdmin, get_searchAccount); 
router.post('/search', isAuth, checkAdmin, post_searchAccount);

router.get('/add', isAuth, checkAdmin, get_addNewAccount);
router.post('/add', isAuth, checkAdmin, post_addNewAccount);

router.get('/delete', isAuth, checkAdmin, get_deleteAccount);
router.post('/delete', isAuth, checkAdmin, post_deleteAccount);

router.get('/update', isAuth, get_updateAccount);
router.post('/update', isAuth, post_updateAccount);

export default router;