import express from 'express'
import pg from 'pg'
import config from '../config.js'
import { getClient, convertIntToTimeString } from '../utils.js';
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getAllPlaylist = async (req, res) => {
    const client_id = await getClient(req, res)
    if(client_id == -1) res.status(500).send({message: 'You are admin'})
    else
        if(client_id) {
            try {
                const playlist = await pool.query('SELECT * FROM playlist WHERE client_id =  $1', [client_id])
                if(playlist.rowCount) res.send(playlist.rows)
                else res.status(500).send({message: 'No results'})
            } catch (err) {
                console.log(err.stack)
            }
        }
}

export const get_getPlaylistbyId = async(req, res) => {
    const playlist_id = req.params.playlistId
    const client_id = await getClient(req, res)
    const client = await pool.query('SELECT client_id FROM playlist WHERE playlist_id = $1', [playlist_id])
    if(client_id == -1 || client_id == client.rows[0].client_id) {
        try {
            const playlist = await pool.query('SELECT * FROM playlist WHERE playlist_id = $1', [playlist_id])     
            res.locals.data = playlist.rows[0]
        } catch (err) {
            console.log(err.stack)
        }

        try {
            const songs = await pool.query('SELECT song.*, artist_name, album_name, album_image FROM song, artist, album, song_added_to_playlist WHERE song.artist_id = artist.artist_id and song.album_id = album.album_id and song.song_id = song_added_to_playlist.song_id and playlist_id = $1', [playlist_id])     
            songs.rows.forEach(row => {
                row.duration = convertIntToTimeString(row.duration)
            })
            res.locals.songs = songs.rows
        } catch (err) {
            console.log(err.stack)
        }
    }
    else res.status(500).send({message: 'You do not have permission to do this'})
    res.render('playlist')
}
export const post_getPlaylistbyId = async (req, res) => {
    const {playlist_id} = req.body
    const client_id = await getClient(req, res)
    const client = await pool.query('SELECT client_id FROM playlist WHERE playlist_id = $1', [playlist_id])
    if(client_id == -1 || client_id == client.rows[0].client_id) {
        try {
            const playlist = await pool.query('SELECT * FROM playlist WHERE playlist_id = $1', [playlist_id])     
            if(playlist.rowCount) res.send(playlist.rows)
            else res.status(500).send({message: 'No results'})   
        } catch (err) {
            console.log(err.stack)
        }
    }
    else res.status(500).send({message: 'You do not have permission to do this'})
}

export const get_addNewPlaylist = async (req, res) => {
    res.render('add-playlist')
}
export const post_addNewPlaylist = async (req, res) => {
    const {playlist_name, playlist_info} = req.body
    const client_id = await getClient(req, res)
    if(client_id > 0) { 
        try {
            if(playlist_name == '') res.status(500).send({message: 'Missing some value'}) 
            else {
                const name = await pool.query('SELECT playlist_name FROM playlist WHERE playlist_name = $1 and client_id = $2', [playlist_name, client_id])
                if(name.rowCount == 0) {
                    const playlist = await pool.query('INSERT INTO playlist(playlist_id, client_id, playlist_name, num_of_songs, total_duration, playlist_info, last_updated_stamp, created_stamp) \
                        VALUES(default, $1, $2, 0, 0, $3, current_timestamp, default) RETURNING *', [client_id, playlist_name, playlist_info])
                    const updateNum = await pool.query('UPDATE client SET num_playlist = num_playlist + 1 WHERE client_id = $1', [client_id])
                    await pool.query('UPDATE account SET last_updated_stamp = current_timestamp WHERE account_id = (SELECT account_id FROM client WHERE client_id = $1)', [client_id])
                    if (playlist.rowCount) {
                        if(updateNum.rowCount) res.status(201).send({message: 'New playlist created'})
                        else res.status(500).send({message: 'Error in updating number of playlist'})
                    } 
                    else res.status(500).send({message: 'Error in creating new playlist'});
                }
                else res.status(500).send({message: 'Playlist name already exists'})
            }
        } catch (err) {
            console.log(err.stack)
        }
    }
    else res.status(500).send({message: 'You are not have permission to do this'})
}

export const get_deletePlaylist = async (req, res) => {
    res.render('playlistViews/deletePlaylist')
}
export const post_deletePlaylist = async (req, res) => {
    const {playlist_id} = req.body
    const client_id = await getClient(req, res)
    const client = await pool.query('SELECT client_id FROM playlist WHERE playlist_id = $1', [playlist_id])
    if(client.rowCount)
        if(client_id == client.rows[0].client_id) { 
            try {
                await pool.query('DELETE FROM song_added_to_playlist WHERE playlist_id = $1', [playlist_id])
                const playlist = await pool.query('DELETE FROM playlist WHERE playlist_id = $1', [playlist_id])
                const updateNum = await pool.query('UPDATE client SET num_playlist = num_playlist - 1 WHERE client_id = $1', [client_id])
                await pool.query('UPDATE account SET last_updated_stamp = current_timestamp WHERE account_id = (SELECT account_id FROM client WHERE client_id = $1 LIMIT 1)', [client_id])
                if (playlist.rowCount) {
                    if(updateNum.rowCount) res.status(201).send({message: 'Playlist deleted'})
                    else res.status(500).send({message: 'Error in updating number of playlist'})
                } 
                else res.status(500).send({message: 'Error in deleting playlist'})
            } catch (err) {
                console.log(err.stack)
            }
        }
        else res.status(500).send({message: 'You are not have permission to do this'})
    else res.status(500).send({message: 'No results'})
}

export const get_updatePlaylist = async (req, res) => {
    res.render('playlistViews/updatePlaylist')
}
export const post_updatePlaylist = async (req, res) => {
    var {playlist_id, playlist_name, playlist_info} = req.body
    const client_id = await getClient(req, res)
    const client = await pool.query('SELECT client_id FROM playlist WHERE playlist_id = $1', [playlist_id])
    if(client_id == client.rows[0].client_id) { 
        try {
            const old_db = await pool.query('SELECT * FROM playlist WHERE playlist_id = $1', [playlist_id])
            if(old_db.rowCount == 0) res.status(500).send({message: 'Playlist does not exist'})
            else {
                if(playlist_name == '') playlist_name = old_db.rows[0].playlist_name
                if(playlist_info == '') playlist_info = old_db.rows[0].playlist_info
                const playlistname_db = await pool.query('SELECT playlist_name FROM playlist WHERE playlist_name = $1 and client_id = $2', [playlist_name, client_id])
                if(playlistname_db.rowCount == 0 || playlist_name == old_db.rows[0].playlist_name) {
                    const playlist = await pool.query('UPDATE playlist SET playlist_name = $2, playlist_info = $3, last_updated_stamp = current_timestamp WHERE playlist_id = $1', [playlist_id, playlist_name, playlist_info])
                    if (playlist.rowCount) res.status(201).send({message: 'Playlist updated'});
                    else res.status(500).send({message: 'Error in updating playlist'});
                }
                else res.status(500).send({message: 'Playlist name already exists'})
            }
        } catch (err) {
            console.log(err.stack)
        }
    }
    else res.status(500).send({message: 'You are not have permission to do this'})
}

export const get_getAllSonginPlaylist = async (req, res) => {
    res.render('playlistViews/getAllSong')
}
export const post_getAllSonginPlaylist = async (req, res) => {
    const {playlist_id} = req.body
    const client_id = await getClient(req, res)
    const client  = await pool.query('SELECT client_id FROM playlist WHERE playlist_id = $1', [playlist_id])
    if(client.rowCount) {
        if(client_id == client.rows[0].client_id) {
            try {
                var playlist = await pool.query('SELECT song.*, artist_name, album_name, album_image FROM song, song_added_to_playlist, artist, album WHERE song.artist_id = artist.artist_id and song.album_id = album.album_id and song.song_id = song_added_to_playlist.song_id and playlist_id = $1', [playlist_id])
                playlist.rows.forEach(row => {
                    row.duration = convertIntToTimeString(row.duration)
                })
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
        if(client_id == client.rows[0].client_id) {
            try {
                const song = await pool.query('SELECT duration FROM song WHERE song_id = $1', [song_id])
                const check = await pool.query('SELECT * FROM song_added_to_playlist WHERE song_id = $1 and playlist_id = $2', [song_id, playlist_id])
                if(check.rowCount) res.status(500).send({message: 'This song has already been in your playlist'})
                else {
                    const playlist = await pool.query('INSERT INTO song_added_to_playlist(song_id, playlist_id, created_stamp) \
                        VALUES($1, $2, default) RETURNING *', [song_id, playlist_id])
                    const change = await pool.query('UPDATE playlist SET num_of_songs = num_of_songs + 1, total_duration = total_duration + $2, last_updated_stamp = current_timestamp WHERE playlist_id = $1', [playlist_id, song.rows[0].duration])
                    if (change.rowCount) 
                        if (playlist.rowCount) res.status(201).send({message: 'New song added to your playlist'});
                        else res.status(500).send({message: 'Error in added new song to your playlist'});
                    else res.status(500).send({message: 'Error in updating changes'});
                }
            } catch (err) {
                console.log(err.stack)
            }
        }
        else res.status(500).send({message: 'You are not have permission to do this'})
    }
    else res.status(500).send({message: 'Playlist does not exist'})
}

export const get_deleteSongInPlaylist = async (req, res) => {
    res.render('playlistViews/deleteSong')
}
export const post_deleteSongInPlaylist = async (req, res) => {
    const {playlist_id, song_id} = req.body
    const client_id = await getClient(req, res)
    const client  = await pool.query('SELECT client_id FROM playlist WHERE playlist_id = $1', [playlist_id])
    if(client.rowCount) {
        if(client_id == client.rows[0].client_id) {
            try {
                const song = await pool.query('SELECT duration FROM song WHERE song_id = $1', [song_id])
                const check = await pool.query('SELECT * FROM song_added_to_playlist WHERE song_id = $1 and playlist_id = $2', [song_id, playlist_id])
                if(check.rowCount == 0) res.status(500).send({message: 'This song is not in your playlist'}) 
                else {
                    const playlist = await pool.query('DELETE FROM song_added_to_playlist WHERE playlist_id = $2 AND song_id = $1', [song_id, playlist_id])     
                    const change = await pool.query('UPDATE playlist SET num_of_songs = num_of_songs - 1, total_duration = total_duration - $2, last_updated_stamp = current_timestamp WHERE playlist_id = $1', [playlist_id, song.rows[0].duration])
                    if (playlist.rowCount) 
                        if (change.rowCount) res.status(201).send({message: 'Song deleted from your playlist'});
                        else res.status(500).send({message: 'Error in updating changes'});
                    else res.status(500).send({message: 'Error in deleting song from your playlist'});
                }
            } catch (err) {
                console.log(err.stack)
            }
        }
        else res.status(500).send({message: 'You are not have permission to do this'})
    }
    else res.status(500).send({message: 'Playlist is not exist'})
}

export default router;