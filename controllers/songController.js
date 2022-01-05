import express from 'express'
import pg from 'pg'
import config from '../config.js'
import {artistUpdateNumofSongs} from './artistController.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getAllSong = async (req, res) => {
    try {
        var song = await pool.query('SELECT * FROM song')
    } catch (err) {
        console.log(err.stack)
    }
    res.send(song)
}

export const get_getSongInfo = async (req, res) => {
    res.render('songViews/searchInfo')
}
export const post_getSongInfo = async (req, res) => {
    console.log(req.body)
    const {song_name, artist_name, album_name, category} = req.body
    try {
        var song = await pool.query('SELECT song_id, song_name, artist_name, album_name, duration, category, average_rate FROM song, artist, album WHERE song_name = $1 or (artist_name = $2 and artist.artist_id = song.artist_id) or (album_name = $3 and album.album_id = song.album_id) or category = $4', [song_name, artist_name, album_name, category])
    } catch (err) {
        console.log(err.stack)
    }    
    res.send(song.rows)
}

export const get_addNewSong = async (req, res) => {
    res.render('songViews/addNewSong')
}
export const post_addNewSong = async (req, res) => {
    const {song_name, artist_name, album_name, duration, category} = req.body
    
    try {
        var artist = await pool.query('SELECT artist.artist_id FROM artist,song WHERE artist_name = $1 and artist.artist_id = song.artist_id  LIMIT 1', [artist_name])
        if(artist) {
            if(album_name == null) {
                var song = await pool.query('INSERT INTO song(song_id, artist_id, album_id, song_name, duration, category, average_rate, last_updated_stamp, created_stamp) \
                VALUES(default, (SELECT artist_id FROM artist WHERE artist_name = $1 LIMIT 1), null, $3, $4, $5, null, null, default) RETURNING *', [artist_id, album_id, song_name, duration, category])
            }
            else {
                var album = await pool.query('SELECT album.album_id FROM album, song WHERE album_name = $1 and album.album_id = song.album_id  LIMIT 1', [album_name])
                if(album) {
                    var song = await pool.query('INSERT INTO song(song_id, artist_id, album_id, song_name, duration, category, average_rate, last_updated_stamp, created_stamp) \
                        VALUES(default, (SELECT artist_id FROM artist WHERE artist_name = $1  LIMIT 1), (SELECT album_id FROM album WHERE album_name = $2 LIMIT 1), $3, $4, $5, null, null, default) RETURNING *', [artist_name, album_name, song_name, duration, category])
                }        
                else res.status(500).send({message: 'Album is not exist'});
            }
        }
        else res.status(500).send({message: 'Artist unknown'});
    } catch (err) {
        console.log(err.stack)
    }
    if (song) {
        res.status(201).send({message: 'New song created', data: song.rows});
        artistUpdateNumofSongs(artist_id);
    } else {
        res.status(500).send({message: 'Error in creating new song'});
    }
}
export const get_deleteSong = async(req, res) => {
    res.render('accountViews/deleteAcc')
} 
export const post_deleteSong = async (req, res) => {
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
export const updateSong = async (req, res) => {
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