import express from 'express'
import jwt from 'jsonwebtoken';
import pg from 'pg'
import config from '../config.js'
import { getClient } from '../utils.js';
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getAllPlaylist = async (req, res) => {
    const client_id = await getClient(req, res)
    if(client_id) {
        try {
            var playlist = await pool.query('SELECT * FROM playlist WHERE client_id =  $1', [client_id])
            res.send(playlist.rows)
        } catch (err) {
            console.log(err.stack)
        }
    }
}

export const get_getPlaylistbyId = async(req, res) => {
    res.render('playlistViews/getInfobyId')
}
export const post_getPlaylistbyId = async (req, res) => {
    const {playlist_id} = req.body
    const client_id = await getClient(req, res)
    if(client_id) {
        try {
            var playlist = await pool.query('SELECT * FROM playlist WHERE playlist_id = $1', [playlist_id])     
            res.send(playlist.rows)   
        } catch (err) {
            console.log(err.stack)
        }
    }
}

export const get_addNewPlaylist = async (req, res) => {
    res.render('playlistViews/createNewPlaylist')
}
export const post_addNewPlaylist = async (req, res) => {
    const {playlist_name, playlist_note} = req.body
    const client_id = await getClient(req, res)
    if(client_id) {
        try {
            const name = await pool.query('SELECT playlist_name FROM playlist WHERE playlist_name = $1 and client_id = $2', [playlist_name, client_id])
            if(name.rowCount == 0) {
                const playlist = await pool.query('INSERT INTO playlist(playlist_id, client_id, playlist_name, num_of_songs, total_duration, playlist_note, last_updated_stamp, created_stamp) \
                    VALUES(default, $1, $2, 0, 0, $3, current_timestamp, default) RETURNING *', [client_id, playlist_name, playlist_note])
                if (playlist.rowCount) {
                    res.status(201).send({message: 'New playlist created'});
                    const updateNum = await pool.query('UPDATE client SET num_playlist = num_playlist + 1, last_updated_timestamp = current_timestamp WHERE client_id = $1', [client_id])
                    if(updateNum.rowCount) res.status(201).send({message: 'Update number of playlist successful'})
                    else res.status(500).send({message: 'Error in updating number of playlist'})
                } 
                else res.status(500).send({message: 'Error in creating new playlist'});
            }
            else res.status(500).send({message: 'Playlist name already exists'})
        } catch (err) {
            console.log(err.stack)
        }
    }
}

export const get_deletePlaylist = async (req, res) => {
    res.render('playlistViews/deletePlaylist')
}
export const post_deletePlaylist = async (req, res) => {
    const {playlist_id} = req.body
    const client_id = await getClient(req, res)
    if(client_id) {
        try {
            const song_added_to_playlist = await pool.query('DELETE FROM song_added_to_playlist WHERE playlist_id = $1', [playlist_id])
            if(song_added_to_playlist) res.status(201).send({message: 'Songs in playlist deleted'})
            else res.status(500).send({message: 'Error deleting songs in playlist'})
            const playlist = await pool.query('DELETE FROM playlist WHERE playlist_id = $1', [playlist_id])
            if (playlist) {
                res.status(201).send({message: 'Playlist deleted'})
                const updateNum = await pool.query('UPDATE client SET num_playlist = num_playlist - 1, last_updated_timestamp = current_timestamp WHERE client_id = $1', [client_id])
                if(updateNum) res.status(201).send({message: 'Update number of playlist successful'})
                else res.status(500).send({message: 'Error in updating number of playlist'})
            } 
            else res.status(500).send({message: 'Error in deleting playlist'})
        } catch (err) {
            console.log(err.stack)
        }
    }
}

export const get_updatePlaylist = async (req, res) => {
    res.render('playlistViews/update')
}
export const post_updatePlaylist = async (req, res) => {
    const {playlist_id, playlist_name, playlist_note} = req.body
    const client_id = await getClient(req, res)
    if(client_id) {
        try {
            var old_db = await pool.query('SELECT * FROM playlist WHERE playlist_id = $1', [playlist_id])
            if(old_db.rowCount == 0) res.status(500).send({message: 'Playlist does not exist'})
            else {
                if(playlist_name == '') playlist_name = old_db.rows[0].playlist_name
                if(playlist_note == '') playlist_note = old_db.rows[0].playlist_note
                var playlistname_db = await pool.query('SELECT playlist_name FROM playlist WHERE playlist_name = $1', [playlist_name])
                if(playlistname_db.rowCount == 0 || playlist_name == old_db.rows[0].playlist_name) {
                    var playlist = await pool.query('UPDATE playlist SET playlistname = $2, playlist_note = $3, last_updated_stamp = current_timestamp WHERE playlist_id = $1', [playlist_id, playlist_name, playlist_note])
                    if (playlist) res.status(201).send({message: 'Playlist updated', data: playlist.rows});
                    else res.status(500).send({message: 'Error in updating playlist'});
                }
                else res.status(500).send({message: 'Playlist name already exists'})
            }
        } catch (err) {
            console.log(err.stack)
        }
    }
}

export const getAllSonginPlaylist = async (req, res) => {
    const {playlist_id} = req.body
    const client_id = await getClient(req, res)
    const client  = await pool.query('SELECT client_id FROM playlist WHERE playlist_id = $1', [playlist_id])
    if(client.rowCount) {
        if(client_id == client.rows[0].client_id || client_id == -1) {
            try {
                var playlist = await pool.query('SELECT song.* FROM song, song_added_to_playlist WHERE song.song_id = song_added_to_playlist.song_id and playlist_id = $1', [playlist_id])
                res.send(playlist.rows)
            } catch (err) {
                console.log(err.stack)
            }
        }
        else res.status(500).send({message: 'You are not have permission to do this'})
    }
    else res.status(500).send({message: 'Playlist is not exist'})
}

export const get_addNewSongToPlaylist = async (req, res) => {
    res.render('playlistViews/addSong')
}
export const post_addNewSongToPlaylist = async (req, res) => {
    const {playlist_id, song_id} = req.body
    const client_id = await getClient(req, res)
    const client  = await pool.query('SELECT client_id FROM playlist WHERE playlist_id = $1', [playlist_id])
    if(client.rowCount) {
        if(client_id == client.rows[0].client_id || client_id == -1) {
            try {
                var playlist = await pool.query('INSERT INTO song_added_to_playlist(song_id, playlist_id, created_stamp) \
                    VALUES($1, $2, default) RETURNING *', [song_id, playlist_id])
                var change = await pool.query('UPDATE playlist SET num_of_songs = num_of_songs + 1, total_duration = (SELECT SUM(duration) FROM song, song_added_to_playlist WHERE song.song_id = song_added_to_playlist.song_id), last_updated_stamp = current_timestamp WHERE playlist_id = $1', [playlist_id])
                if (change) res.status(201).send({message: 'Update changes successful'});
                else res.status(500).send({message: 'Error in updating changes'});
                if (playlist) res.status(201).send({message: 'New song added to your playlist'});
                else res.status(500).send({message: 'Error in added new song to your playlist'});
            } catch (err) {
                console.log(err.stack)
            }
        }
        else res.status(500).send({message: 'You are not have permission to do this'})
    }
    else res.status(500).send({message: 'Playlist is not exist'})
}

export const get_deleteSongInPlaylist = async (req, res) => {
    res.render('playlistViews/deleteSong')
}
export const post_deleteSongInPlaylist = async (req, res) => {
    const {playlist_id, song_id} = req.body
    const client_id = await getClient(req, res)
    const client  = await pool.query('SELECT client_id FROM playlist WHERE playlist_id = $1', [playlist_id])
    if(client.rowCount) {
        if(client_id == client.rows[0].client_id || client_id == -1) {
            try {
                var playlist = await pool.query('DELETE FROM song_added_to_playlist WHERE playlist_id = $2 AND song_id = $1', [song_id, playlist_id])     
                if (playlist) res.status(201).send({message: 'Song deleted from your playlist', data: playlist.rows});
                else res.status(500).send({message: 'Error in deleting song from your playlist'});
                var change = await pool.query('UPDATE playlist SET num_of_songs = num_of_songs - 1, total_duration = (SELECT SUM(duration) FROM song, song_added_to_playlist WHERE song.song_id = song_added_to_playlist.song_id), last_updated_stamp = current_timestamp WHERE playlist_id = $1', [playlist_id])
                if (change) res.status(201).send({message: 'Update changes successful'});
                else res.status(500).send({message: 'Error in updating changes'});
            } catch (err) {
                console.log(err.stack)
            }
        }
        else res.status(500).send({message: 'You are not have permission to do this'})
    }
    else res.status(500).send({message: 'Playlist is not exist'})
}

export default router;