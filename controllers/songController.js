import express from 'express'
import pg from 'pg'
import config from '../config.js'
import {albumUpdateNumofSongs, post_addNewAlbum} from './albumController.js'
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
    res.send(song.rows)
}

export const get_getSongInfo = async (req, res) => {
    res.render('songViews/searchInfo')
}
export const post_getSongInfo = async (req, res) => {
    console.log(req.body)
    const {song_name, artist_name, album_name, category} = req.body
    try {
        var song = await pool.query('SELECT * FROM song where song_name = $1', [song_name])
        // var song = await pool.query('SELECT song_id, song_name, artist_name, album_name, duration, category, average_rate FROM song, artist, album WHERE song_name = $1 or (artist_name = $2) or (album_name = $3) or category = $4', [song_name, artist_name, album_name, category])
    } catch (err) {
        console.log(err.stack)
    }    
    res.send(song.rows)
}

export const get_addNewSong = async (req, res) => {
    res.render('songViews/addNewSong')
}

export const post_addNewSong = async (req, res) => {
    console.log(req.body)
    var {song_name, artist_name, album_name, song_image, song_info, song_link, duration, category} = req.body;
    duration = duration == '' ? 0 : duration;
    console.log(typeof(duration))
    try {
        // Kiểm tra tên bài hát có trùng không
        var name = await pool.query('SELECT * FROM song, artist WHERE song.artist_id = artist.artist_id and song_name = $1 and artist_name = $2', [song_name, artist_name])

        // Nếu artist này chưa có song nào cùng song_name
        if (name.rowCount == 0) {

            // Lấy thông tin artist
            var artist = await pool.query('SELECT artist_id FROM artist WHERE artist_name = $1 LIMIT 1', [artist_name])
            
            // Nếu artist tồn tại
            if (artist.rowCount) {
                var album = await pool.query('SELECT album_id FROM album WHERE album_name = $1  LIMIT 1', [album_name])
                if (album.rowCount) {
                    var artist_id = artist.rows[0].artist_id
                    var album_id = album.rows[0].album_id
                    var song = await pool.query('INSERT INTO song(song_id, artist_id, album_id, song_name, song_image, song_info, song_link, duration, category, sum_rate, num_of_ratings, num_of_comments, last_updated_stamp, created_stamp) \
                        VALUES(default, $1, $2, $3, $4, $5, $6, $7, $8, 0, 0, 0, current_timestamp, default) RETURNING *', [artist_id, album_id, song_name, song_image, song_info, song_link, duration, category])
                    if (song.rowCount) {
                        // Lấy artist_id và album_id để cập nhật
                        var artist_id = artist.rows[0].artist_id
                        var album_id = album.rows[0].album_id

                        // Cập nhật num_of_albums
                        var update_artist = await pool.query('UPDATE artist SET num_of_songs = num_of_songs + 1 WHERE artist_id = $1;', [artist_id])
                        var update_album_songs = await pool.query('UPDATE album SET num_of_songs = num_of_songs + 1 WHERE album_id = $1;', [album_id])
                        var update_album_duration = await pool.query('UPDATE album SET total_duration = total_duration + $1 WHERE album_id = $2;', [duration, album_id])
                        
                        // Trả kết quả
                        if (update_artist.rowCount && update_album_songs.rowCount && update_album_duration.rowCount) {
                            res.status(201).send({message: 'Song added. artist & album updated successfully'});
                        } else {
                            res.status(500).send({message: 'Error in updating artist and album'})
                        }
                    } else {
                        res.status(500).send({message: 'Error in added new song'});
                    }
                }        
                else res.status(500).send({message: 'Album does not exist'});
            }
            else res.status(500).send({message: 'Artist unknown'});
        }
        else res.status(500).send({message: 'Song name of this artist already exists'})
    } catch (err) {
        console.log(err.stack)
    }
}
export const get_deleteSong = async(req, res) => {
    res.render('songViews/deleteSong')
} 
export const post_deleteSong = async (req, res) => {
    const {id} = req.body;
    try {
        var song = await pool.query('SELECT artist_id, album_id, duration FROM song WHERE song_id = $1', [id])
        if (song.rowCount == 0) {
            res.status(500).send({message: 'Song ID does not exist'})
        }
        var artist_id = song.rows[0].artist_id
        var album_id = song.rows[0].album_id
        var duration = song.rows[0].duration
        console.log(artist_id)

        // Xóa song
        var song = await pool.query('DELETE FROM song WHERE song_id = $1', [id])
        if (song.rowCount) {
            res.status(201).send({message: 'Song deleted', data: song.rows});

            // Cập nhật num_of_songs
            var update_artist = await pool.query('UPDATE artist SET num_of_songs = num_of_songs - 1 WHERE artist_id = $1;', [artist_id])
            var update_album = await pool.query('UPDATE album SET num_of_songs = num_of_songs - 1 WHERE album_id = $1;', [album_id])
            var update_album_duration = await pool.query('UPDATE album SET total_duration = total_duration - $1 WHERE album_id = $2;', [duration, album_id])
            
            // Trả kết quả
            if (update_artist.rowCount && update_album.rowCount && update_album_duration.rowCount) {
                res.status(201).send({message: 'Song deleted. #Songs, duration updated successfully'});
            } else {
                res.status(500).send({message: 'Error in updating number of songs, duration'})
            }
        } else {
            res.status(500).send({message: 'Error in deleting song'});
        }
    } catch (err) {
        console.log(err.stack)
    }
}
export const updateSong = async (req, res) => {
    
}

export default router;