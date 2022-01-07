import express from 'express'
import pg from 'pg'
import config from '../config.js'
import { getToken } from '../utils.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const get_Signup = (req,res) =>{
    res.render('userViews/signup');
}
export const post_Signup = async (req, res) => {
    //console.log(req.body)
    const {username, current_password, avatar, full_name, email, phone_number} = req.body
    if(username == null || current_password == null || full_name == null || email == null || phone_number == null)
        res.status(500).send({message: 'Missing some value'});
    else 
        try {
            var user = await pool.query('INSERT INTO account(account_id, username, current_password, avatar, user_role, full_name, birth_date, email, phone_number, last_updated_stamp, created_stamp) \
                VALUES(default, $1, $2, $3, \'client\', $4, null, $5, $6, null, default) RETURNING *', [username, current_password, avatar, full_name, email, phone_number])
            //console.log(req)
        } catch (err) {
            console.log(err.stack)
        }
        if (user.rows[0] != null) {
            res.send({
                id: user.rows[0].account_id,
                user_name: user.rows[0].user_name,
                isAdmin: (user.rows[0].user_role == 'admin'),
                token: getToken(user)
            })
        } else {
            res.status(500).send({message: 'Error'});
        }
}

export const get_Login = async (req, res) => {
    res.render('userViews/login');
}
export const post_Login = async (req, res) => {
    //console.log(req.body)
    const {username, password} = req.body
    if(username == null || password == null)
        res.status(500).send({message: 'Missing some value'});
    else {
        try {
            var user = await pool.query('SELECT * FROM account WHERE username = $1 and current_password = $2 LIMIT 1', [username, password])
        } catch (err) {
            console.log(err.stack)
        }
        if (user.rows[0] != null) {
            res.send({
                id: user.rows[0].account_id,
                user_name: user.rows[0].user_name,
                isAdmin: (user.rows[0].user_role == 'admin'),
                token: getToken(user)
            })
        }
        else {
            res.status(500).send({message: 'Wrong username or password'});
        }
    }
}

export const loginAdmin = async(req, res) => {
    console.log('admin')
    res.send({message: 'Admin views'})
} 
export default router;