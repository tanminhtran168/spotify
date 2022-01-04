import express from 'express'
import pg from 'pg'
import config from '../config.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getAllAccount = async (req, res) => {
    try {
        var accounts = await pool.query('SELECT * FROM account')
        console.log('get')
    } catch (err) {
        console.log(err.stack)
    }
    res.send(accounts)
}
export const getAccountInfo = async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        var accounts = await pool.query('SELECT * FROM account WHERE account_id = $1', [id])
        console.log('get')
    } catch (err) {
        console.log(err.stack)
    }    
    res.send(accounts)
}
export const addNewAccount = async (req, res) => {
    const {account_id, username, current_password, is_active, user_role, full_name, birth_date, email, phone_number, avatar, last_updated_stamp} = req.body
    
    try {
        /*var accounts = await pool.query('INSERT INTO account(account_id, username, current_password, is_active, user_role, full_name, birth_date, email, phone_number, avatar, last_updated_stamp) \
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', [account_id, username, current_password, is_active, user_role, full_name, birth_date, email, phone_number, avatar, last_updated_stamp])
        */
        const text = 'INSERT INTO account(account_id, username, current_password, is_active, user_role, full_name, birth_date, email, phone_number, last_updated_stamp, created_stamp) \
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *'
        const values = ['M001', 'duongnn', '123456', true, 'client', 'Nam Duong Ngo', null, 'duongnamngohl@gmail.com', '0963648035', null, null]
        var accounts = await pool.query(text, values)
        console.log(req)
    } catch (err) {
        console.log(err.stack)
    }
    if (accounts) {
        res.status(201).send({message: 'New account created', data: accounts.rows});
    } else {
        res.status(500).send({message: 'Error in creating new account'});
    }
}
export const deleteAccount = async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        var accounts = await pool.query('DELETE FROM account WHERE account_id = $1', [id])
        console.log('delete')
        console.log(req)
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
        var accounts = await pool.query('UPDATE account SET username = $2, current_password = $3, is_active = $4, user_role = $5, full_name = $6, birth_date = $7, email = $8, phone_number = $9, avatar = $10, last_updated_stamp = $11', 
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