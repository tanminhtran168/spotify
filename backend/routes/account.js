import express from 'express';
import config from '../config.js';
import pkg from 'pg';

const {Pool} = pkg;
const pool = new Pool(config.POSTGRES_INFO)

const router = express.Router();
const app = express()
app.use(express.json());

router.get('/', async (req, res) => {
    try {
        var accounts = await pool.query('SELECT * FROM account')
    } catch (err) {
        console.log(err.stack)
    }
    res.send(accounts.rows)
})

router.post('/', async (req, res) => {
    const text = 'INSERT INTO account(account_id, username, current_password, is_active, user_role, full_name, birth_date, email, phone_number, avatar, last_updated_stamp, created_stamp) \
                                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *'
    // const values = ['M001', 'minhtt', '161718', true, 'admin', 'Tan Minh Tran', '08-16-2000', 'tanminhtran168@gmail.com', '123456789', 'avatar.png', NULL, CURRENT_TIMESTAMP]
    console.log('==============================================================')
    console.log(req.body)
    // try {
    //     var account = await pool.query(text)
    // } catch (err) {
    //     console.log(err.stack)
    // }
    // if (account) {
    //     return res.status(201).send({message: 'new account created', data: account.rows});
    // } else {
    //     return res.status(500).send({message: 'error in creating new account'});
    // }
    res.send('no')
})

export default router;