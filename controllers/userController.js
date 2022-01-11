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
    const {user_name, current_password, confirm_password, avatar, full_name, birth_date, email, phone_number} = req.body
    if(user_name == '' || current_password == '' || confirm_password == '' || full_name == '' || email == '' || phone_number == '' || birth_date == '')
        res.status(500).send({message: 'Missing some value'});
    else {
        try {
            var username_db = await pool.query('SELECT username FROM account WHERE username = $1', [user_name])
            if(username_db.rowCount == 0) {
                if(current_password == confirm_password) {
                    var email_db = await pool.query('SELECT email FROM account WHERE email = $1', [email])
                    if(email_db.rowCount == 0) {
                        var phone_db = await pool.query('SELECT phone_number FROM account WHERE phone_number = $1', [phone_number])
                        if(phone_db.rowCount == 0) {
                            var user = await pool.query('INSERT INTO account(account_id, username, current_password, avatar, user_role, full_name, birth_date, email, phone_number, last_updated_stamp, created_stamp) \
                                VALUES(default, $1, $2, $3, \'client\', $4, $5, $6, $7, current_timestamp, default) RETURNING *', [user_name, current_password, avatar, full_name, birth_date,email, phone_number])
                            var client = await pool.query('INSERT INTO client(client_id, account_id, num_artist_favorite, num_playlist) VALUES (default, (SELECT account_id FROM account WHERE username = $1 LIMIT 1), 0, 0)', [user_name])
                            if(client.rowCount == 0) res.status(500).send({message: 'Error in adding new client'})
                            if (user.rows[0] != null) {
                                res.send({
                                    id: user.rows[0].account_id,
                                    user_name: user.rows[0].username,
                                    isAdmin: (user.rows[0].user_role == 'admin'),
                                    token: getToken(user)
                                })
                            } else res.status(500).send({message: 'Error'});
                        }
                        else res.status(500).send({message: 'Phone number already exists'})
                    }
                    else res.status(500).send({message: 'Email already exists'})
                }
                else res.status(500).send({message: 'Wrong confirm password'})
            } 
            else res.status(500).send({message: 'Username already exists'})
        } catch (err) {
            console.log(err.stack)
        }
    }
}

export const get_Login = async (req, res) => {
    res.render('userViews/login');
}
export const post_Login = async (req, res) => {
    console.log(req.body)
    const {user_name, password} = req.body
    console.log(user_name)
    console.log(password)
    if(user_name == '' || password == '')
        res.status(500).send({message: 'Missing some value'});
    else {
        try {
            var user = await pool.query('SELECT * FROM account WHERE username = $1 and current_password = $2 LIMIT 1', [user_name, password])
            if (user.rowCount) {
                var token = getToken(user)
                res.cookie('token', token, {expires: new Date(Date.now() + 90000000)})
                res.send({
                    id: user.rows[0].account_id,
                    user_name: user.rows[0].username,
                    isAdmin: (user.rows[0].user_role == 'admin'),
                    token: token
                })
            }
            else {
                res.status(500).send({message: 'Wrong username or password'});
            }
        } catch (err) {
            console.log(err.stack)
        }
    }
}

export const loginAdmin = async(req, res) => {
    console.log('admin')
    res.send({message: 'Admin views'})
}

export const addArtistFavorite = async(req, res) => {
    const {artist_id, client_id} = req.body
    const favorite = await pool.query('INSERT INTO artist_favorite(client_id, artist_id, last_updated_stamp, created_stamp) VALUES ($1, $2, current_timestamp, default)', [client_id, artist_id])
    if(favorite) {
        res.status(201).send({message: 'Add artist favorite successful'})
        const updateNum = await pool.query('UPDATE client SET num_artist_favorite = (SELECT COUNT artist_id FROM artist_favorite WHERE client_id = $1)', [client_id])
        if(updateNum) res.status(201).send({message: 'Update number of artist favorite successful'})
        else res.status(500).send({message: 'Error in updating number of artist favorite'})
    }
    else res.status(500).send({message: 'Error in adding artist'})
}

export const deleteArtistFavorite = async(req, res) => {
    const {artist_id, client_id} = req.body
    const favorite = await pool.query('DELETE FROM artist_favorite WHERE client_id = $1 and artist_id = $2)', [client_id, artist_id])
    if(favorite) {
        res.status(201).send({message: 'Delete artist favorite successful'})
        const updateNum = await pool.query('UPDATE account, client SET num_artist_favorite = (SELECT COUNT artist_id FROM artist_favorite WHERE client_id = $1), last_updated_timestamp = current_timestamp WHERE client.account_id = account.account_id', [client_id])
        if(updateNum) res.status(201).send({message: 'Update number of artist favorite successful'})
        else res.status(500).send({message: 'Error in updating number of artist favorite'})
    }
    else res.status(500).send({message: 'Error in deleting artist'})
}

export default router;