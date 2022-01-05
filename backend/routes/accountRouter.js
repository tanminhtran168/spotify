import express from 'express'
import bodyParser from 'body-parser';
import {getAllAccount, get_getAccountInfo, post_getAccountInfo, post_addNewAccount, get_addNewAccount, post_deleteAccount, get_deleteAccount, updateAccount} from '../controllers/accountController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/',  getAllAccount);

router.get('/search',  get_getAccountInfo); 
router.post('/search',  post_getAccountInfo);

router.get('/signup', get_addNewAccount);
router.post('/signup', post_addNewAccount);

router.get('/delete', get_deleteAccount);
router.post('/delete', post_deleteAccount);

router.put('/id/:id/', updateAccount);

export default router;