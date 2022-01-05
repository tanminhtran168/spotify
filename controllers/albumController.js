import express from 'express'
import pg from 'pg'
import config from '../config.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getAllAlbum = async (req, res) => {
    try {
        var album = await pool.query('SELECT * FROM album')
        console.log('get')
    } catch (err) {
        console.log(err.stack)
    }
    res.send(album)
}
export const getAlbumInfo = async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        var album = await pool.query('SELECT * FROM album WHERE album_id = $1', [id])
        console.log('get')
    } catch (err) {
        console.log(err.stack)
    }    
    res.send(album)
}
export const addNewAlbum = async (req, res) => {
    const {album_id, client_id, album_name, num_of_songs, album_note, last_updated_stamp, created_stamp} = req.body
    
    try {
        var album = await pool.query('INSERT INTO album(album_id, client_id, album_name, num_of_songs, album_note, last_updated_stamp, created_stamp) \
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [album_id, client_id, album_name, num_of_songs, album_note, last_updated_stamp, created_stamp])
        console.log(req)
    } catch (err) {
        console.log(err.stack)
    }
    if (album) {
        res.status(201).send({message: 'New album created', data: album.rows});
    } else {
        res.status(500).send({message: 'Error in creating new album'});
    }
}
export const deleteAlbum = async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        var album = await pool.query('DELETE FROM album WHERE album_id = $1', [id])
        console.log('delete')
        console.log(req)
    } catch (err) {
        console.log(err.stack)
    }
    if (album) {
        res.status(201).send({message: 'album deleted', data: album.rows});
    } else {
        res.status(500).send({message: 'Error in deleting album'});
    }
}
export const updateAlbum = async (req, res) => {
    const id = parseInt(req.params.id)
    const {album_id, client_id, album_name, num_of_songs, album_note, last_updated_stamp, created_stamp} = req.body
    try {
        var album = await pool.query('UPDATE album SET albumname = $3, num_of_songs = $4, album_note = $5, last_updated_stamp = $6', 
            [album_id, client_id, album_name, num_of_songs, album_note, last_updated_stamp, created_stamp])
        console.log('put')
        console.log(req)
    } catch (err) {
        console.log(err.stack)
    }
    if (album) {
        res.status(201).send({message: 'album updated', data: album.rows});
    } else {
        res.status(500).send({message: 'Error in updating album'});
    }
}

export const getSonginAlbum = async (req, res) => {
    const {song_id, album_id, last_updated_stamp, created_stamp} = req.body
    try {
        var album = await pool.query('SELECT * FROM song WHERE song_id =  $1', [song_id, album_id, last_updated_stamp, created_stamp])
        console.log('get')
    } catch (err) {
        console.log(err.stack)
    }
    res.send(album)
}

export const addNewSongToAlbum = async (req, res) => {
    const {song_id, album_id, last_updated_stamp, created_stamp} = req.body
    try {
        var album = await pool.query('INSERT INTO song_added_to_album(song_id, album_id, last_updated_stamp, created_stamp) \
            VALUES($1, $2, $3, $4) RETURNING *', [song_id, album_id, last_updated_stamp, created_stamp])
        console.log(req)
    } catch (err) {
        console.log(err.stack)
    }
    if (album) {
        res.status(201).send({message: 'New song added to your album', data: album.rows});
    } else {
        res.status(500).send({message: 'Error in added new song to your album'});
    }
}

export const deleteSongInAlbum = async (req, res) => {
    const {song_id, album_id, last_updated_stamp, created_stamp} = req.body
    try {
        var album = await pool.query('DELETE FROM song_added_to_album WHERE album_id = $2 AND song_id = $1', [song_id, album_id, last_updated_stamp, created_stamp])
        console.log('delete')
        console.log(req)
    } catch (err) {
        console.log(err.stack)
    }
    if (album) {
        res.status(201).send({message: 'Song deleted from your album', data: album.rows});
    } else {
        res.status(500).send({message: 'Error in deleting song from your album'});
    }
}
export default router;