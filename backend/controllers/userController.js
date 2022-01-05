import express from 'express'
import pg from 'pg'
import config from '../config.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const get_Signup =(req,res) =>{
    res.render('signup');
}
export const post_Signup = async (req, res) => {
    console.log(req.body)
    const {username, current_password, full_name, email, phone_number} = req.body
    if(username == null || current_password == null || full_name == null || email == null || phone_number == null)
        res.status(500).send({message: 'Missing some value'});
    else 
        try {
            var user = await pool.query('INSERT INTO account(account_id, username, current_password, user_role, full_name, birth_date, email, phone_number, last_updated_stamp, created_stamp) \
                VALUES(default, $1, $2, \'client\', $3, null, $4, $5, null, default) RETURNING *', [username, current_password, full_name, email, phone_number])
            //console.log(req)
        } catch (err) {
            console.log(err.stack)
        }
    if (user) {
        res.status(201).send({message: 'Sign up completed'});
    } else {
        res.status(500).send({message: 'Error'});
    }
}

export const get_Login = async (req, res) => {
    res.render('login');
}
export const post_Login = async (req, res) => {
    console.log(req.body)
    const {username, password} = req.body
    if(username == null || password == null)
        res.status(500).send({message: 'Missing some value'});
    else 
        try {
            var user = await pool.query('SELECT * FROM account WHERE username = $1 and current_password = $2', [username, password])
            
        } catch (err) {
            console.log(err.stack)
        }
    if (user != null) {
        res.status(201).send({message: 'Log in successful'});
    } else {
        res.status(500).send({message: 'Wrong username or password'});
    }
}
export default router;