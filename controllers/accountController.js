import express from 'express'
import pg from 'pg'
import config from '../config.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getAllAccount = async (req, res) => {
    try {
        var account = await pool.query('SELECT * FROM account')
        res.send(account.rows)
    } catch (err) {
        console.log(err.stack)
    }
}
export const get_getAccountInfobyId = async (req, res) => {
    res.render('accountViews/getInfobyId')
}

export const post_getAccountInfobyId = async (req, res) => {
    const {account_id} = req.body
    try {
        var account = await pool.query('SELECT * FROM account WHERE account_id = $1', [account_id])
        res.send(account.rows)
    } catch (err) {
        console.log(err.stack)
    }    
}

export const get_searchAccount = async (req, res) => {
    res.render('accountViews/searchInfo')
}
export const post_searchAccount = async (req, res) => {
    const {user_name, full_name, email, phone_number} = req.body
    try {
        var account = await pool.query('SELECT * FROM account WHERE username = $1 or full_name = $2 or email = $3 or phone_number = $4', [user_name, full_name, email, phone_number])
        res.send(account.rows)
    } catch (err) {
        console.log(err.stack)
    }    
}
export const get_addNewAccount = (req,res) =>{
    res.render('accountViews/addNewAccount');
}
export const post_addNewAccount = async (req, res) => {
    const {user_name, current_password, confirm_password, avatar, user_role, full_name, birth_date, email, phone_number} = req.body
    if(user_name == '' || current_password == '' || confirm_password == '' || full_name == '' || email == '' || phone_number == '' || birth_date == '')
        res.status(500).send({message: 'Missing some value'});
    else {
        try {
            if(user_role == 'client' || user_role == 'admin') {
                var username_db = await pool.query('SELECT username FROM account WHERE username = $1', [user_name])
                if(username_db.rowCount == 0) {
                    if(current_password == confirm_password) {
                        var email_db = await pool.query('SELECT email FROM account WHERE email = $1', [email])
                        if(email_db.rowCount == 0) {
                            var phone_db = await pool.query('SELECT phone_number FROM account WHERE phone_number = $1', [phone_number])
                            if(phone_db.rowCount == 0) {
                                var user = await pool.query('INSERT INTO account(account_id, username, current_password, avatar, user_role, full_name, birth_date, email, phone_number, last_updated_stamp, created_stamp) \
                                    VALUES(default, $1, $2, $3, $4, $5, $6, $7, $8, current_timestamp, default) RETURNING *', [user_name, current_password, avatar, user_role, full_name, birth_date, email, phone_number])
                                if(user_role == 'client') {
                                    var client = await pool.query('INSERT INTO client(client_id, account_id, num_artist_favorite, num_playlist) VALUES (default, (SELECT account_id FROM account WHERE username = $1 LIMIT 1), 0, 0)', [user_name])
                                    if(client.rowCount == 0) res.status(500).send({message: 'Error in adding new client'})
                                }
                                if (user.rowCount) res.status(201).send({message: 'New account created'})
                                else res.status(500).send({message: 'Error in adding new account'});
                            }
                            else res.status(500).send({message: 'Phone number already exists'})
                        }
                        else res.status(500).send({message: 'Email already exists'})
                    }
                    else res.status(500).send({message: 'Wrong confirm password'})
                } 
                else res.status(500).send({message: 'Username already exists'})
            }
            else res.status(500).send({message: 'This role does not exist'})
        } catch (err) {
            console.log(err.stack)
        }
    }
}
export const get_deleteAccount = async(req, res) => {
    res.render('accountViews/deleteAcc')
} 
export const post_deleteAccount = async (req, res) => {
    const {account_id} = req.body
    try {
        var client = await pool.query('SELECT client_id FROM client WHERE account_id = $1', [account_id])
        if(client.rowCount) {
            var playlist = await pool.query('SELECT playlist_id FROM playlist WHERE client_id = $1', [client.rows[0].client_id])
            var x = 0;
            while(x < playlist.rowCount) {
                var delSongInPlaylist = await pool.query('DELETE FROM song_added_to_playlist WHERE playlist_id = $1', [playlist.rows[x].playlist_id])
                x += 1;
            }
            var delRating = await pool.query('DELETE FROM rating WHERE client_id = $1', [client.rows[0].client_id])
            var delComment = await pool.query('DELETE FROM comment WHERE client_id = $1', [client.rows[0].client_id])
            var delArtistFavorite = await pool.query('DELETE FROM artist_favorite WHERE client_id = $1', [client.rows[0].client_id])
            var delPlaylist = await pool.query('DELETE FROM playlist WHERE client_id = $1', [client.rows[0].client_id])
            var delClient = await pool.query('DELETE FROM client WHERE account_id = $1', [account_id])
        }
        var delAccount = await pool.query('DELETE FROM account WHERE account_id = $1', [account_id])    
        if (delAccount) res.status(201).send({message: 'Account deleted'});
        else res.status(500).send({message: 'Error in deleting account'});
    } catch (err) {
        console.log(err.stack)
    }
}

export const get_updateAccount = async (req, res) => {
    res.render('accountViews/updateAcc')
}
export const post_updateAccount = async (req, res) => {
    var {account_id, user_name, old_password, new_password, confirm_new_password, avatar, user_role, full_name, birth_date, email, phone_number} = req.body
    try {
        var old_db = await pool.query('SELECT * FROM account WHERE account_id = $1', [account_id])
        if(old_db.rowCount == 0) {
            res.status(500).send({message: 'Account does not exist'})
        }
        else {
            if(old_password != old_db.rows[0].current_password) {
                res.status(500).send({message: 'Wrong current password'})
            }
            else {
                if(user_name == '') user_name = old_db.rows[0].username
                if(new_password == '' && confirm_new_password == '') new_password = confirm_new_password = old_password
                if(avatar == '') avatar = old_db.rows[0].avatar
                if(user_role == '') user_role = old_db.rows[0].user_role
                if(full_name == '') full_name = old_db.rows[0].full_name
                if(birth_date == '') birth_date = old_db.rows[0].birth_date
                if(email == '') email = old_db.rows[0].email
                if(phone_number == '') phone_number = old_db.rows[0].phone_number
                var username_db = await pool.query('SELECT username FROM account WHERE username = $1', [user_name])
                if(username_db.rowCount == 0 || user_name == old_db.rows[0].username) {
                    if(new_password == confirm_new_password) {
                        var email_db = await pool.query('SELECT email FROM account WHERE email = $1', [email])
                        if(email_db.rowCount == 0 || email == old_db.rows[0].email) {
                            var phone_db = await pool.query('SELECT phone_number FROM account WHERE phone_number = $1', [phone_number])
                            if(phone_db.rowCount == 0 || phone_number == old_db.rows[0].phone_number) {
                                if(user_role == 'admin' || user_role == 'client') {
                                    if(user_role == 'client' && old_db.user_role == 'admin') {
                                        await pool.query('INSERT INTO client(client_id, account_id, num_artist_favorite, num_playlist) VALUES(default, $1, 0, 0)', [account_id])
                                    }
                                    if(user_role == 'admin' && old_db.user_role == 'client') {
                                        var client = await pool.query('SELECT client_id FROM client WHERE account_id = $1', [account_id])
                                        var playlist = await pool.query('SELECT playlist_id FROM playlist WHERE client_id = $1', [client.rows[0].client_id])
                                        var x = 0;
                                        while(x < playlist.rowCount) {
                                            var delSongInPlaylist = await pool.query('DELETE FROM song_added_to_playlist WHERE playlist_id = $1', [playlist.rows[x].playlist_id])
                                            x += 1;
                                        }
                                        var delRating = await pool.query('DELETE FROM rating WHERE client_id = $1', [client.rows[0].client_id])
                                        var delComment = await pool.query('DELETE FROM comment WHERE client_id = $1', [client.rows[0].client_id])
                                        var delArtistFavorite = await pool.query('DELETE FROM artist_favorite WHERE client_id = $1', [client.rows[0].client_id])
                                        var delPlaylist = await pool.query('DELETE FROM playlist WHERE client_id = $1', [client.rows[0].client_id])
                                        var delClient = await pool.query('DELETE FROM client WHERE account_id = $1', [account_id])
                                    }
                                    var account = pool.query('UPDATE account SET username = $2, current_password = $3, avatar = $4, user_role = $5, full_name = $6, birth_date = $7, email = $8, phone_number = $9, last_updated_stamp = current_timestamp WHERE account_id = $1', 
                                        [account_id, user_name, new_password, avatar, user_role, full_name, birth_date, email, phone_number])
                                    if (account) res.status(201).send({message: 'Account updated'});
                                    else res.status(500).send({message: 'Error in updating account'});
                                }
                                else res.status(500).send({message: 'This role does not exist'})
                            }
                            else res.status(500).send({message: 'Phone number already exists'})
                        }
                        else res.status(500).send({message: 'Email already exists'})
                    }
                    else res.status(500).send({message: 'Wrong confirm password'})
                } 
                else res.status(500).send({message: 'Username already exists'})
            }
        }
    } catch (err) {
        console.log(err.stack)
    }
}

export default router;