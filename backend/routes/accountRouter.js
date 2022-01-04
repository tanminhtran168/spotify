import express from 'express'
import bodyParser from 'body-parser';
import {getAllAccount, getAccountInfo, addNewAccount, deleteAccount, updateAccount} from '../controllers/accountController.js'
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.get('/',  getAllAccount);

//router.get('/:id/',  getAccountInfo); 

router.get('/:id/', addNewAccount);

router.delete('/:id/', deleteAccount);

router.put('/:id/', updateAccount);

export default router;