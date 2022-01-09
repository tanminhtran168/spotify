import express from 'express'
import pg from 'pg'
import config from '../config.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getAllPlaylist = async (req, res) => {
    const {client_id} = req.body
    try {
        var playlist = await pool.query('SELECT * FROM playlist WHERE client_id =  $1', [client_id])
        console.log('get')
    } catch (err) {
        console.log(err.stack)
    }
    res.send(playlist)
}

export const get_getPlaylistInfo = async(req, res) => {
    res.render('playlistViews/searchInfo')
}
export const post_getPlaylistInfo = async (req, res) => {
    const {client_id, playlist_id, playlist_name} = req.body
    try {
        var playlist = await pool.query('SELECT * FROM playlist WHERE (playlist_name = $3 or playlist_id = $2) and client_id = $1', [client_id, playlist_id, playlist_name])        
        var change = await pool.query('UPDATE playlist SET num_of_songs = (SELECT COUNT song_id FROM song_added_to_playlist WHERE playlist_id = $1), total_duration = (SELECT SUM(duration), last_updated_timestamp =  current_timestamp FROM song, song_added_to_playlist WHERE song.song_id = song_added_to_playlist.song_id) WHERE playlist_id = $1', [playlist_id])
    } catch (err) {
        console.log(err.stack)
    }
    res.send(playlist)
}

export const get_addNewPlaylist = async (req, res) => {
    res.render('playlistViews/createNewPlaylist')
}
export const post_addNewPlaylist = async (req, res) => {
    const {client_id, playlist_name, playlist_note} = req.body
    
    try {
        var name = await pool.query('SELECT playlist_name FROM playlist WHERE playlist_name = $1 and client_id = $2', [playlist_name, client_id])
        if(name.rows[0] == null) {
            var playlist = await pool.query('INSERT INTO playlist(playlist_id, client_id, playlist_name, num_of_songs, total_duration, playlist_note, last_updated_stamp, created_stamp) \
                VALUES(default, $1, $2, 0, 0, $3, current_timestamp, default) RETURNING *', [client_id, playlist_name, playlist_note])
            if (playlist) {
                res.status(201).send({message: 'New playlist created'});
                const updateNum = await pool.query('UPDATE account, client SET num_playlist = (SELECT COUNT playlist_id FROM song_added_to_playlist WHERE client_id = $1), last_updated_timestamp =  current_timestamp WHERE client.account_id = account.account_id', [client_id])
                if(updateNum) res.status(201).send({message: 'Update number of playlist successful'})
                else res.status(500).send({message: 'Error in updating number of playlist'})
            } else {
                res.status(500).send({message: 'Error in creating new playlist'});
            }
        }
        else res.status(500).send({message: 'Playlist name already exists'})
    } catch (err) {
        console.log(err.stack)
    }
}

export const get_deletePlaylist = async (req, res) => {
    res.render('playlistViews/deletePlaylist')
}
export const post_deletePlaylist = async (req, res) => {
    const {playlist_id} = req.body
    try {
        var song_added_to_playlist = await pool.query('DELETE FROM song_added_to_playlist WHERE playlist_id = $1', [playlist_id])
        if(song_added_to_playlist) {
            res.status(201).send({message: 'Songs in playlist deleted'})
        }
        else {
            res.status(500).send({message: 'Error deleting songs in playlist'})
        }
        var playlist = await pool.query('DELETE FROM playlist WHERE playlist_id = $1', [playlist_id])
        if (playlist) {
            res.status(201).send({message: 'Playlist deleted'})
            const updateNum = await pool.query('UPDATE account, client SET num_playlist = (SELECT COUNT playlist_id FROM song_added_to_playlist WHERE client_id = $1), last_updated_timestamp =  current_timestamp WHERE client.account_id = account.account_id', [client_id])
            if(updateNum) res.status(201).send({message: 'Update number of playlist successful'})
            else res.status(500).send({message: 'Error in updating number of playlist'})
        } else {
            res.status(500).send({message: 'Error in deleting playlist'})
        }
    } catch (err) {
        console.log(err.stack)
    }
}

export const updatePlaylist = async (req, res) => {
    const {playlist_id, client_id, playlist_name, playlist_note} = req.body
    try {
        var playlist = await pool.query('UPDATE playlist SET playlistname = $3, playlist_note = $4, last_updated_stamp = current_timestamp WHERE playlist_id = $1', 
            [playlist_id, client_id, playlist_name, playlist_note])
    } catch (err) {
        console.log(err.stack)
    }
    if (playlist) {
        res.status(201).send({message: 'Playlist updated', data: playlist.rows});
    } else {
        res.status(500).send({message: 'Error in updating playlist'});
    }
}

export const getAllSonginPlaylist = async (req, res) => {
    const {playlist_id} = req.body
    try {
        var playlist = await pool.query('SELECT song.* FROM song, song_added_to_playlist WHERE song.song_id = song_added_to_playlist.song_id and playlist_id = $1', [playlist_id])
    } catch (err) {
        console.log(err.stack)
    }
    res.send(playlist)
}

export const getSongInfoinPlaylist = async (req, res) => {
    const {playlist_id, song_id} = req.body
    try {
        var playlist = await pool.query('SELECT * FROM song WHERE song_id = $2', [playlist_id, song_id])
    } catch (err) {
        console.log(err.stack)
    }
    res.send(playlist)
}

export const addNewSongToPlaylist = async (req, res) => {
    const {song_id, playlist_id} = req.body
    try {
        var playlist = await pool.query('INSERT INTO song_added_to_playlist(song_id, playlist_id, created_stamp) \
            VALUES($1, $2, default) RETURNING *', [song_id, playlist_id])
        var change = await pool.query('UPDATE playlist SET num_of_songs = (SELECT COUNT song_id FROM song_added_to_playlist WHERE playlist_id = $1), total_duration = (SELECT SUM(duration) FROM song, song_added_to_playlist WHERE song.song_id = song_added_to_playlist.song_id), last_updated_stamp = current_timestamp WHERE playlist_id = $1', [playlist_id])
        if (change) {
            res.status(201).send({message: 'Update changes successful'});
        } else {
            res.status(500).send({message: 'Error in updating changes'});
        }
    } catch (err) {
        console.log(err.stack)
    }
    if (playlist) {
        res.status(201).send({message: 'New song added to your playlist'});
    } else {
        res.status(500).send({message: 'Error in added new song to your playlist'});
    }
}

export const deleteSongInPlaylist = async (req, res) => {
    const {song_id, playlist_id} = req.body
    try {
        var playlist = await pool.query('DELETE FROM song_added_to_playlist WHERE playlist_id = $2 AND song_id = $1', [song_id, playlist_id])     
        if (playlist) {
            res.status(201).send({message: 'Song deleted from your playlist', data: playlist.rows});
        } else {
            res.status(500).send({message: 'Error in deleting song from your playlist'});
        }
        var change = await pool.query('UPDATE playlist SET num_of_songs = (SELECT COUNT song_id FROM song_added_to_playlist WHERE playlist_id = $1), total_duration = (SELECT SUM(duration) FROM song, song_added_to_playlist WHERE song.song_id = song_added_to_playlist.song_id), last_updated_stamp = current_timestamp WHERE playlist_id = $1', [playlist_id])
        if (change) {
            res.status(201).send({message: 'Update changes successful'});
        } else {
            res.status(500).send({message: 'Error in updating changes'});
        }    
    } catch (err) {
        console.log(err.stack)
    }
}
export default router;