import express from 'express';
import config from '../config.js';
import bodyParser from 'body-parser';
import pkg from 'pg';

const {Pool} = pkg;
const pool = new Pool(config.POSTGRES_INFO)

const router = express.Router();
const app = express()
app.use(bodyParser.urlencoded({extended:false}))

router.get('/', async (req, res) => {
    try {
        var accounts = await pool.query('SELECT * FROM account')
        console.log('get')
    } catch (err) {
        console.log(err.stack)
    }
    res.send(accounts.rows)
})

router.post('/', async (req, res) => {
    console.log('post')
    const text = 'INSERT INTO account(account_id, username, current_password, is_active, user_role, full_name, birth_date, email, phone_number, avatar, last_updated_stamp) \
                                 VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *'
    const values = ['M003', 'minhtt', '161718', true, 'admin', 'Tan Minh Tran', '08-16-2000', 'tanminhtran168@gmail.com', '123456789', 'avatar.png', null]
    console.log(req)
    try {
        var account = await pool.query(text, values)
    } catch (err) {
        console.log(err.stack)
    }
    if (account) {
        return res.status(201).send({message: 'new account created', data: account.rows});
    } else {
        return res.status(500).send({message: 'error in creating new account'});
    }
})

export default router;