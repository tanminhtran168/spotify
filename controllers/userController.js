import express from 'express'
import pg from 'pg'
import jwt from 'jsonwebtoken'
import config from '../config.js'
import fs from 'fs'
import path from 'path'
const __dirname = path.resolve(path.dirname(''));
import { getToken, convertIntToTimeString, saveFile, isImage, getClient } from '../utils.js'

const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const get_Signup = async (req,res) => {
    if(req.cookies.token != null) res.status(500).send({message: 'You must log out first'}) 
    else res.render('signup', {layout: false});
}
const uploadFolder = path.join(__dirname, "public","images", "userImages");
export const post_Signup = async (req, res) => {
    const {user_name, current_password, confirm_password, full_name, birth_date, email, phone_number} = req.fields
    const {avatar} = req.files
    if(avatar != null) {
        if(!isImage(avatar)) {
            res.status(500).send({message: 'Wrong file format'}) 
            return
        }
    }
    if(user_name == '' || current_password == '' || confirm_password == '' || full_name == '' || email == '' || phone_number == '' || birth_date == '')
        res.status(500).send({message: 'Missing some value'});
    else {
        try {
            var username_db = await pool.query('SELECT username FROM account WHERE username = $1', [user_name])
            if(username_db.rowCount == 0) {
                if(current_password == confirm_password) {
                    var now = new Date()
                    var birth = new Date(birth_date)
                    if(now.getTime() < birth.getTime()) {
                        res.status(500).send({message: 'Your birthday must be earlier than today'})
                        return
                    }
                    var email_db = await pool.query('SELECT email FROM account WHERE email = $1', [email])
                    if(email_db.rowCount == 0) {
                        if(phone_number.length > 13 || phone_number.length < 7) {
                            res.status(500).send({message: 'You have typed wrong phone number'})
                            return
                        }
                        var x = 0
                        while(x < phone_number.length) {
                            if(phone_number[x] > '9' || phone_number[x] < 0) {
                                res.status(500).send({message: 'You have typed wrong phone number'})
                                return
                            }
                            x += 1
                        }
                        var phone_db = await pool.query('SELECT phone_number FROM account WHERE phone_number = $1', [phone_number])
                        if(phone_db.rowCount == 0) {
                            if(avatar == null) {
                                var image_link = '/images/user.png'
                            }
                            else {
                                var image_link = '/images/userImages/' + user_name + '.jpg'
                                const imageName = user_name + '.jpg';
                                saveFile(avatar, uploadFolder, imageName)
                            }
                            var user = await pool.query('INSERT INTO account(account_id, username, current_password, avatar, user_role, full_name, birth_date, email, phone_number, last_updated_stamp, created_stamp) \
                                VALUES(default, $1, $2, $3, \'client\', $4, $5, $6, $7, current_timestamp, default) RETURNING *', [user_name, current_password, image_link, full_name, birth_date,email, phone_number])
                            var client = await pool.query('INSERT INTO client(client_id, account_id, num_artist_favorite, num_playlist) VALUES (default, (SELECT account_id FROM account WHERE username = $1 LIMIT 1), 0, 0)', [user_name])
                            if(client.rowCount == 0) res.status(500).send({message: 'Error in adding new client'})
                            if (user.rowCount) {
                                res.send({
                                    id: user.rows[0].account_id,
                                    user_name: user.rows[0].username,
                                    isAdmin: false,
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
    if(req.cookies.token != null) res.status(500).send({message: 'You must log out first'}) 
    else res.render('login', {layout: false});
}
export const post_Login = async (req, res) => {
    const {user_name, password} = req.body
    if(user_name == '' || password == '')
        res.status(500).send({message: 'Missing some value'});
    else {
        try {
            var user = await pool.query('SELECT account_id, username, user_role FROM account WHERE username = $1 and current_password = $2 LIMIT 1', [user_name, password])
            if (user.rowCount) {
                var token = await getToken(user.rows[0])
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

export const get_logout = async(req, res) => {
    res.render('userViews/logout')
}
export const post_logout = async(req, res) => {
    res.clearCookie('token')
    res.send({message: 'Log out completed'})
}

export const loginAdmin = async(req, res) => {
    console.log('admin')
    res.send({message: 'Admin views'})
}

export const get_dashboard = async(req, res) => {
    const token = req.cookies.token
    if(token)
    {
        res.locals.loggedIn = true;
        var account_id
        jwt.verify(token, config.JWT_SECRET, (err, decode) => {
            if (err) return res.status(401).send({ message: 'Error in authentication' });
            account_id = decode.id
        })
        try {
            var playlists = await pool.query('SELECT playlist.* FROM playlist, client, account  WHERE playlist.client_id = client.client_id and account.account_id = client.account_id and account.account_id = $1', [account_id])
            res.locals.playlists = playlists.rows
        }
        catch (err) {
            console.log(err.stack)
        }    
        try {
            const client_id = await getClient(req, res)
            var recents = await pool.query('SELECT song.*, artist.artist_name, album.album_image FROM song, artist, album, recently_listened WHERE song.album_id = album.album_id and recently_listened.song_id = song.song_id and artist.artist_id = album.artist_id and client_id = $1 ORDER BY created_stamp DESC', [client_id])
            res.locals.recents = recents.rows
        }
        catch (err) {
            console.log(err.stack)
        }    
        try {
            var artist = await pool.query('SELECT artist.* FROM artist, artist_favorite, client WHERE artist.artist_id = artist_favorite.artist_id and client.client_id = artist_favorite.client_id and account_id = $1', [account_id])
            res.locals.artists = artist.rows
        } catch (err) {
            console.log(err.stack)
        }    
    }
    else
        res.locals.loggedIn = false;
    res.render('dashboard')
}
export const get_queue = async(req, res) =>{
    res.locals.songs = null
    res.render('queue')
}
export const post_queue = async(req, res) =>{
    //console.log(req.body)
    res.locals.songs = req.body
    res.render('queue')
}
export const searchQuery = async(req, res) => {
    var key_word = req.params.keyword;
    key_word = "%" + key_word +  "%"
    try {
        var song = await pool.query('SELECT song.*, artist_name, album_name, album_image FROM song, artist, album WHERE song_name LIKE $1 and song.artist_id = artist.artist_id and song.album_id = album.album_id', [key_word])
        res.locals.song_result = song.rows;
        song.rows.forEach(row => {
            row.duration = convertIntToTimeString(row.duration)
        })
    } catch (err) {
        console.log(err.stack)
    }    

    try {
        var album = await pool.query('SELECT album.*, artist_name FROM album, artist WHERE album_name LIKE $1 and artist.artist_id = album.artist_id', [key_word])
        res.locals.album_result = album.rows
    } catch (err) {
        console.log(err.stack)
    }    

    try {
        var artist = await pool.query('SELECT * FROM artist WHERE artist_name LIKE $1', [key_word])
        res.locals.artist_result = artist.rows
    } catch (err) {
        console.log(err.stack)
    }    
    res.render('search')
}

export const get_countViews = async(req, res) => {
    fs.readFile('public/views.txt', function (err, data) {
        if (err) return console.error(err);
        const num = parseInt(data.toString());
        //console.log(num)
        res.status(201).send({'Number of views': num})
    });
}

export default router;