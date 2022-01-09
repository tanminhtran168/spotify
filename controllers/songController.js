import express from 'express'
import pg from 'pg'
import config from '../config.js'
import {albumUpdateNumofSongs} from './albumController.js'
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
    const {song_name, artist_name, album_name, song_image, song_info, duration, category} = req.body
    
    try {
        var name = await pool.query('SELECT song_name FROM song WHERE song_name = $1', [song_name])
        if(name.rows[0].song_name == null) {
            var artist = await pool.query('SELECT artist.artist_id FROM artist,song WHERE artist_name = $1 and artist.artist_id = song.artist_id  LIMIT 1', [artist_name])
            if(artist) {
                if(album_name == null) {
                    var song = await pool.query('INSERT INTO song(song_id, artist_id, album_id, song_name, song_image, song_info, duration, category, sum_rate, num_of_ratings, num_of_comments, last_updated_stamp, created_stamp) \
                    VALUES(default, (SELECT artist_id FROM artist WHERE artist_name = $1 LIMIT 1), null, $3, $4, $5, $6, $7, 0, 0, 0, current_timestamp, default) RETURNING *', [artist_name, album_name, song_name, song_image, song_info, duration, category])
                }
                else {
                    var album = await pool.query('SELECT album.album_id FROM album, song WHERE album_name = $1 and album.album_id = song.album_id  LIMIT 1', [album_name])
                    if(album) {
                        var song = await pool.query('INSERT INTO song(song_id, artist_id, album_id, song_name, duration, category, sum_rate, num_of_ratings, num_of_comments, last_updated_stamp, created_stamp) \
                            VALUES(default, (SELECT artist_id FROM artist WHERE artist_name = $1  LIMIT 1), (SELECT album_id FROM album WHERE album_name = $2 LIMIT 1), $3, $4, $5, $6, $7, 0, 0, 0, current_timestamp, default) RETURNING *', [artist_name, album_name, song_name, song_image, song_info, duration, category])
                    }        
                    else res.status(500).send({message: 'Album is not exist'});
                }
            }
            else res.status(500).send({message: 'Artist unknown'});
        }
        else res.status(500).send({message: 'Song name already exists'})
    } catch (err) {
        console.log(err.stack)
    }
    if (song) {
        res.status(201).send({message: 'New song created', data: song.rows});
        artistUpdateNumofSongs(artist_name)
        if(album_name != null) albumUpdateNumofSongs(album_name)
    } else {
        res.status(500).send({message: 'Error in creating new song'});
    }
}
export const get_deleteSong = async(req, res) => {
    res.render('songViews/deleteSong')
} 
export const post_deleteSong = async (req, res) => {
    console.log(req.body)
    const {id} = req.body
    try {
        var playlist = await pool.query('DELETE FROM song_added_to_playlist WHERE song_id = $1', [id])
        if(playlist) {            
            var song = await pool.query('DELETE FROM song WHERE song_id = $1', [id])
            console.log('delete')
            if (song) {
                res.status(201).send({message: 'Song deleted', data: song.rows});
                var artist = await pool.query('SELECT artist_name FROM artist, song WHERE artist.song_id = album.song_id')
                if (artist) {
                    res.status(201).send({message: 'Update number of songs in artist successful'})
                    artistUpdateNumofSongs(artist.rows[0].artist_name)
                }
                else res.status(500).send({message: 'Error in updating number of songs in artist'})
                var album = await pool.query('SELECT album_name FROM song, album WHERE album.song_id = album.song_id')
                if (album) {
                    res.status(201).send({message: 'Update number of songs in album successful'})
                    if(album.rows[0] != null) albumUpdateNumofSongs(album.rows[0].album_name)
                }
                else res.status(500).send({message: 'Error in updating number of songs in album'})
            } else {
                res.status(500).send({message: 'Error in deleting song'});
            }
        }
        else  res.status(500).send({message: 'Error in deleting song in playlist'});
    } catch (err) {
        console.log(err.stack)
    }
}
export const updateSong = async (req, res) => {
    
}

export default router;