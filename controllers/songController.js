import express from 'express'
import pg from 'pg'
import config from '../config.js'
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
    const {song_name, artist_name, album_name, duration, category} = req.body
    try {
        var song = await pool.query('SELECT * FROM song WHERE song_name = $1 or full_name = $2 or email = $3 or phone_number = $4', [song_name, artist_name, album_name, duration, category])
    } catch (err) {
        console.log(err.stack)
    }    
    res.send(song.rows)
}
export const addNewSong = async (req, res) => {
    const {song_id, artist_id, album_id, song_name, duration, category, average_rate, last_updated_stamp, created_stamp} = req.body
    
    try {
        var song = await pool.query('INSERT INTO song(song_id, artist_id, album_id, song_name, duration, category, average_rate, last_updated_stamp, created_stamp) \
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [song_id, artist_id, album_id, song_name, duration, category, average_rate, last_updated_stamp, created_stamp])
        console.log(req)
    } catch (err) {
        console.log(err.stack)
    }
    if (song) {
        res.status(201).send({message: 'New song created', data: song.rows});
    } else {
        res.status(500).send({message: 'Error in creating new song'});
    }
}
export const deleteSong = async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        var song = await pool.query('DELETE FROM song WHERE song_id = $1', [id])
        console.log('delete')
        console.log(req)
    } catch (err) {
        console.log(err.stack)
    }
    if (song) {
        res.status(201).send({message: 'Song deleted', data: song.rows});
    } else {
        res.status(500).send({message: 'Error in deleting song'});
    }
}
export const updateSong = async (req, res) => {
    const id = parseInt(req.params.id)
    const {song_id, artist_id, album_id, song_name, duration, category, average_rate, last_updated_stamp, created_stamp} = req.body
    try {
        var song = await pool.query('UPDATE song SET song_name = $4, duration = $5, category = $6, average_rate = $7, last_updated_stamp = $8', 
            [song_id, artist_id, album_id, song_name, duration, category, average_rate, last_updated_stamp, created_stamp])
        console.log('put')
        console.log(req)
    } catch (err) {
        console.log(err.stack)
    }
    if (song) {
        res.status(201).send({message: 'Song updated', data: song.rows});
    } else {
        res.status(500).send({message: 'Error in updating song'});
    }
}

export default router;