import express from 'express'
import pg from 'pg'
import config from '../config.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getAllPlaylist = async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        var playlist = await pool.query('SELECT * FROM playlist WHERE client_id =  $1', [id])
        console.log('get')
    } catch (err) {
        console.log(err.stack)
    }
    res.send(playlist)
}
export const getPlaylistInfo = async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        var playlist = await pool.query('SELECT * FROM playlist WHERE playlist_id = $1', [id])
        console.log('get')
    } catch (err) {
        console.log(err.stack)
    }    
    res.send(playlist)
}
export const addNewPlaylist = async (req, res) => {
    const {playlist_id, client_id, playlist_name, num_of_songs, playlist_note, last_updated_stamp, created_stamp} = req.body
    
    try {
        var playlist = await pool.query('INSERT INTO playlist(playlist_id, client_id, playlist_name, num_of_songs, playlist_note, last_updated_stamp, created_stamp) \
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [playlist_id, client_id, playlist_name, num_of_songs, playlist_note, last_updated_stamp, created_stamp])
        console.log(req)
    } catch (err) {
        console.log(err.stack)
    }
    if (playlist) {
        res.status(201).send({message: 'New playlist created', data: playlist.rows});
    } else {
        res.status(500).send({message: 'Error in creating new playlist'});
    }
}
export const deletePlaylist = async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        var playlist = await pool.query('DELETE FROM playlist WHERE playlist_id = $1', [id])
        console.log('delete')
        console.log(req)
    } catch (err) {
        console.log(err.stack)
    }
    if (playlist) {
        res.status(201).send({message: 'Playlist deleted', data: playlist.rows});
    } else {
        res.status(500).send({message: 'Error in deleting playlist'});
    }
}
export const updatePlaylist = async (req, res) => {
    const id = parseInt(req.params.id)
    const {playlist_id, client_id, playlist_name, num_of_songs, playlist_note, last_updated_stamp, created_stamp} = req.body
    try {
        var playlist = await pool.query('UPDATE playlist SET playlistname = $3, num_of_songs = $4, playlist_note = $5, last_updated_stamp = $6', 
            [playlist_id, client_id, playlist_name, num_of_songs, playlist_note, last_updated_stamp, created_stamp])
        console.log('put')
        console.log(req)
    } catch (err) {
        console.log(err.stack)
    }
    if (playlist) {
        res.status(201).send({message: 'Playlist updated', data: playlist.rows});
    } else {
        res.status(500).send({message: 'Error in updating playlist'});
    }
}

export const getSonginPlaylist = async (req, res) => {
    const {song_id, playlist_id, last_updated_stamp, created_stamp} = req.body
    try {
        var playlist = await pool.query('SELECT * FROM song WHERE song_id =  $1', [song_id, playlist_id, last_updated_stamp, created_stamp])
        console.log('get')
    } catch (err) {
        console.log(err.stack)
    }
    res.send(playlist)
}

export const addNewSongToPlaylist = async (req, res) => {
    const {song_id, playlist_id, last_updated_stamp, created_stamp} = req.body
    try {
        var playlist = await pool.query('INSERT INTO song_added_to_playlist(song_id, playlist_id, last_updated_stamp, created_stamp) \
            VALUES($1, $2, $3, $4) RETURNING *', [song_id, playlist_id, last_updated_stamp, created_stamp])
        console.log(req)
    } catch (err) {
        console.log(err.stack)
    }
    if (playlist) {
        res.status(201).send({message: 'New song added to your playlist', data: playlist.rows});
    } else {
        res.status(500).send({message: 'Error in added new song to your playlist'});
    }
}

export const deleteSongInPlaylist = async (req, res) => {
    const {song_id, playlist_id, last_updated_stamp, created_stamp} = req.body
    try {
        var playlist = await pool.query('DELETE FROM song_added_to_playlist WHERE playlist_id = $2 AND song_id = $1', [song_id, playlist_id, last_updated_stamp, created_stamp])
        console.log('delete')
        console.log(req)
    } catch (err) {
        console.log(err.stack)
    }
    if (playlist) {
        res.status(201).send({message: 'Song deleted from your playlist', data: playlist.rows});
    } else {
        res.status(500).send({message: 'Error in deleting song from your playlist'});
    }
}
export default router;