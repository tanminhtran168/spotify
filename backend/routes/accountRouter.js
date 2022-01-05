import express from 'express'
import bodyParser from 'body-parser';
import {getAllAccount, getAccountInfo, post_addNewAccount, get_addNewAccount, post_deleteAccount, get_deleteAccount, updateAccount} from '../controllers/accountController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/',  getAllAccount);

router.get('/id/:id',  getAccountInfo); 

router.get('/signup', get_addNewAccount);

router.post('/signup', post_addNewAccount);

router.get('/id/:id', get_deleteAccount);

router.delete('/id/:id', post_deleteAccount);

router.put('/id/:id/', updateAccount);

export default router;