import express from 'express'
import pg from 'pg'
import config from '../config.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getAllAccount = async (req, res) => {
    try {
        var accounts = await pool.query('SELECT * FROM account')
    } catch (err) {
        console.log(err.stack)
    }
    res.send(accounts.rows)
}

export const get_getAccountInfo = async (req, res) => {
    res.render('accountViews/searchInfo')
}

export const post_getAccountInfo = async (req, res) => {
    console.log(req.body)
    const {username, full_name, email, phone_number} = req.body
    try {
        var accounts = await pool.query('SELECT * FROM account WHERE username = $1 or full_name = $2 or email = $3 or phone_number = $4', [username, full_name, email, phone_number])
    } catch (err) {
        console.log(err.stack)
    }    
    res.send(accounts.rows)
}
export const get_addNewAccount =(req,res) =>{
    res.render('accountViews/signup');
}
export const post_addNewAccount = async (req, res) => {
    console.log(req.body)
    const {username, current_password, avatar, full_name, email, phone_number} = req.body
    if(username == null || current_password == null || full_name == null || email == null || phone_number == null)
        res.status(500).send({message: 'Missing some value'});
    else 
        try {
            var accounts = await pool.query('INSERT INTO account(account_id, username, current_password, avatar, user_role, full_name, birth_date, email, phone_number, last_updated_stamp, created_stamp) \
                VALUES(default, $1, $2, \'client\', $3, $4, null, $5, $6, null, default) RETURNING *', [username, current_password, avatar, full_name, email, phone_number])
            console.log(req)
        } catch (err) {
            console.log(err.stack)
        }
    if (accounts) {
        res.status(201).send({message: 'New account created', data: accounts.rows});
    } else {
        res.status(500).send({message: 'Error'});
    }
}
export const get_deleteAccount = async(req, res) => {
    res.render('accountViews/deleteAcc')
} 
export const post_deleteAccount = async (req, res) => {
    console.log(req.body)
    const {id} = req.body
    try {
        var accounts = pool.query('DELETE FROM account WHERE account_id = $1', [id])
        console.log('delete')
    } catch (err) {
        console.log(err.stack)
    }
    if (accounts) {
        res.status(201).send({message: 'Account deleted', data: accounts.rows});
    } else {
        res.status(500).send({message: 'Error in deleting account'});
    }
}
export const updateAccount = async (req, res) => {
    const id = parseInt(req.params.id)
    const {account_id, username, current_password, is_active, user_role, full_name, birth_date, email, phone_number, avatar, last_updated_stamp, created_stamp} = req.body
    try {
        var accounts = pool.query('UPDATE account SET username = $2, current_password = $3, is_active = $4, user_role = $5, full_name = $6, birth_date = $7, email = $8, phone_number = $9, avatar = $10, last_updated_stamp = $11', 
            [account_id, username, current_password, is_active, user_role, full_name, birth_date, email, phone_number, avatar, last_updated_stamp, created_stamp])
        console.log('put')
        console.log(req)
    } catch (err) {
        console.log(err.stack)
    }
    if (accounts) {
        res.status(201).send({message: 'Account updated', data: accounts.rows});
    } else {
        res.status(500).send({message: 'Error in updating account'});
    }
}

export default router;