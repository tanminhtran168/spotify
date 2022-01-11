import express from 'express'
import pg from 'pg'
import config from '../config.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getAllSong = async (req, res) => {
    try {
        var song = await pool.query('SELECT * FROM song')
        res.send(song.rows)
    } catch (err) {
        console.log(err.stack)
    }
}

export const get_getSongInfobyId = async (req, res) => {
    res.render('songViews/getInfobyId')
}
export const post_getSongInfobyId = async (req, res) => {
    const {song_id} = req.body
    try {
        var song = await pool.query('SELECT song.*, artist_name, album_name FROM song, artist, album WHERE song.artist_id = artist.artist_id and song.album_id = album.album_id and song_id = $1', [song_id])
        res.send(song.rows)
    } catch (err) {
        console.log(err.stack)
    }    
}

export const get_searchSong = async (req, res) => {
    res.render('songViews/searchInfo')
}
export const post_searchSong = async (req, res) => {
    var {key_word} = req.body
    key_word = "%" + key_word +  "%"
    try {
        var song = await pool.query('SELECT song.*, artist_name, album_name FROM song, artist, album WHERE song_name LIKE $1 and song.artist_id = artist.artist_id and song.album_id = album.album_id', [key_word])
        res.send(song.rows)
    } catch (err) {
        console.log(err.stack)
    }    
}

export const get_addNewSong = async (req, res) => {
    res.render('songViews/addNewSong')
}

export const post_addNewSong = async (req, res) => {
    var {song_name, artist_name, album_name, song_image, song_info, song_link, duration, category} = req.body;
    if(song_name == '' || artist_name == '' || album_name == '' , duration == '' , category == '' )
        res.status(500).send({message: 'Missing some value'})
    else 
        try {
            duration = duration == '' ? 0 : duration;
            // Kiểm tra tên bài hát có trùng không
            var name = await pool.query('SELECT * FROM song WHERE song_name = $1', [song_name])
            // Nếu artist này chưa có song nào cùng song_name
            if (name.rowCount == 0) {
                // Lấy thông tin artist
                var artist = await pool.query('SELECT artist_id FROM artist WHERE artist_name = $1', [artist_name])
                // Nếu artist tồn tại
                if (artist.rowCount) {
                    var artist_id = artist.rows[0].artist_id
                    var album = await pool.query('SELECT album_id FROM album WHERE album_name = $1 and artist_id = $2', [album_name, artist_id])
                    if (album.rowCount) {
                        var album_id = album.rows[0].album_id
                        var song = await pool.query('INSERT INTO song(song_id, artist_id, album_id, song_name, song_image, song_info, song_link, duration, category, sum_rate, num_of_ratings, num_of_comments, last_updated_stamp, created_stamp) \
                            VALUES(default, $1, $2, $3, $4, $5, $6, $7, $8, 0, 0, 0, current_timestamp, default) RETURNING *', [artist_id, album_id, song_name, song_image, song_info, song_link, duration, category])
                        if (song.rowCount) {
                            // Lấy artist_id và album_id để cập nhật
                            var artist_id = artist.rows[0].artist_id
                            var album_id = album.rows[0].album_id
                            // Cập nhật num_of_albums
                            var update_artist = await pool.query('UPDATE artist SET num_of_songs = num_of_songs + 1, last_updated_stamp = current_timestamp WHERE artist_id = $1;', [artist_id])
                            var update_album_songs = await pool.query('UPDATE album SET num_of_songs = num_of_songs + 1, last_updated_stamp = current_timestamp WHERE album_id = $1;', [album_id])
                            var update_album_duration = await pool.query('UPDATE album SET total_duration = total_duration + $1, last_updated_stamp = current_timestamp WHERE album_id = $2;', [duration, album_id])
                            // Trả kết quả
                            if (update_artist.rowCount && update_album_songs.rowCount && update_album_duration.rowCount) {
                                res.status(201).send({message: 'Song added. artist & album updated successfully'});
                            } else res.status(500).send({message: 'Error in updating artist and album'})
                        } 
                        else res.status(500).send({message: 'Error in added new song'});
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
    const {song_id} = req.body;
    try {
        var song = await pool.query('SELECT artist_id, album_id, duration FROM song WHERE song_id = $1', [song_id])
        if (song.rowCount == 0) res.status(500).send({message: 'Song ID does not exist'})
        var artist_id = song.rows[0].artist_id
        var album_id = song.rows[0].album_id
        var duration = song.rows[0].duration
        var playlist = await pool.query('SELECT playlist_id FROM song_added_to_playlist WHERE song_id = $1', [song_id])
        // Cập nhật num_of_songs trong playlist
        var y = 0
        while(y < playlist.rowCount) {
            var playlist_id = playlist.rows[y].playlist_id
            await pool.query('UPDATE playlist SET total_duration = total_duration - $1, num_of_songs = num_of_songs - 1, last_updated_stamp = current_timestamp WHERE playlist_id = $2', [duration, playlist_id])
            y += 1
        }
        // Cập nhật num_of_songs, duration
        var update_artist = await pool.query('UPDATE artist SET num_of_songs = num_of_songs - 1, last_updated_stamp = current_timestamp WHERE artist_id = $1;', [artist_id])
        var update_album = await pool.query('UPDATE album SET num_of_songs = num_of_songs - 1, last_updated_stamp = current_timestamp WHERE album_id = $1;', [album_id])
        var update_album_duration = await pool.query('UPDATE album SET total_duration = total_duration - $1, last_updated_stamp = current_timestamp WHERE album_id = $2;', [duration, album_id])
        var delSongaddedtoPlaylist = await pool.query('DELETE FROM song_added_to_playlist WHERE song_id = $1', [song_id])
        // Xóa rating, comment của bài hát
        var delRating = await pool.query('DELETE FROM rating WHERE song_id = $1', [song_id])
        var delComment = await pool.query('DELETE FROM comment WHERE song_id = $1', [song_id])
        // Xóa song
        var song = await pool.query('DELETE FROM song WHERE song_id = $1', [song_id])
        if(song.rowCount) res.status(201).send({message: 'Song deleted'});
        else res.status(500).send({message: 'Error in deleting song'});
    } catch (err) {
        console.log(err.stack)
    }
}
export const get_updateSong = async (req, res) => {
    res.render('songViews/updateSong')
}
export const post_updateSong = async (req, res) => {
    var {song_id, song_name, artist_name, album_name, song_image, song_info, song_link, duration, category} = req.body
    if(song_id == '') res.status(500).send({message: 'Song does not exist'})
    else {
        try {
            var old_db = await pool.query('SELECT * FROM song WHERE song_id = $1', [song_id])
            if(old_db.rowCount == 0) res.status(500).send({message: 'Song does not exist'})
            else {
                if(song_name == '') song_name = old_db.rows[0].song_name
                if(song_image == '') song_image = old_db.rows[0].song_image
                if(song_link == '') song_link = old_db.rows[0].song_link
                if(song_info == '') song_info = old_db.rows[0].song_info
                if(duration == '') duration = old_db.rows[0].duration
                if(category == '') category = old_db.rows[0].category
                var songname_db = await pool.query('SELECT song_name FROM song WHERE song_name = $1', [song_name])
                if(songname_db.rowCount == 0 || song_name == old_db.rows[0].song_name) {
                    var old_artist = await pool.query('SELECT * FROM artist WHERE artist_id = $1', [old_db.rows[0].artist_id])
                    var new_artist
                    if(artist_name == '') new_artist = old_artist 
                    else new_artist = await pool.query('SELECT * FROM artist WHERE artist_name = $1', [artist_name])
                    if(new_artist.rowCount) {
                        var old_album = await pool.query('SELECT * FROM album WHERE album_id = $1', [old_db.rows[0].album_id])
                        var new_album
                        if(album_name == '') new_album = old_album 
                        else new_album = await pool.query('SELECT * FROM album WHERE album_name = $1', [album_name])
                        if(new_album.rowCount) {
                            if(new_album.rows[0].artist_id == new_artist.rows[0].artist_id) {
                                // Cập nhật num_of_songs trong artist
                                await pool.query('UPDATE artist SET num_of_songs = num_of_songs - 1, last_updated_stamp = current_timestamp WHERE artist_id = $1', [old_artist.rows[0].artist_id])
                                await pool.query('UPDATE artist SET num_of_songs = num_of_songs + 1, last_updated_stamp = current_timestamp WHERE artist_id = $1', [new_artist.rows[0].artist_id])
                                // Cập nhật num_of_songs, duration trong album
                                await pool.query('UPDATE album SET num_of_songs = num_of_songs - 1, last_updated_stamp = current_timestamp WHERE album_id = $1', [old_album.rows[0].album_id])
                                await pool.query('UPDATE album SET num_of_songs = num_of_songs + 1, last_updated_stamp = current_timestamp WHERE album_id = $1', [new_album.rows[0].album_id])
                                await pool.query('UPDATE album SET total_duration = total_duration - $1, last_updated_stamp = current_timestamp WHERE album_id = $2;', [old_db.rows[0].duration, old_album.rows[0].album_id])
                                await pool.query('UPDATE album SET total_duration = total_duration + $1, last_updated_stamp = current_timestamp WHERE album_id = $2;', [duration, new_album.rows[0].album_id])
                                var playlist = await pool.query('SELECT playlist_id FROM song_added_to_playlist WHERE song_id = $1', [song_id])
                                var x = 0;
                                while(x < playlist.rowCount) {
                                    await pool.query('UPDATE playlist SET total_duration = total_duration - $1 + $2, last_updated_stamp = current_timestamp WHERE playlist_id = $3;', [old_db.rows[0].duration, duration, playlist.rows[x].playlist_id])
                                    x += 1
                                }
                                // Cập nhật song
                                var song = pool.query('UPDATE song SET artist_id = $2, album_id = $3, song_name = $4, song_image = $5, song_info = $6, song_link = $7, duration = $8, category = $9, last_updated_stamp = current_timestamp WHERE song_id = $1', [song_id, new_artist.rows[0].artist_id, new_album.rows[0].album_id, song_name, song_image, song_info, song_link, duration, category])
                                if (song) res.status(201).send({message: 'Song updated'})
                                else res.status(500).send({message: 'Error in updating song'})
                            }
                            else res.status(500).send({message: 'Album does not exist'})
                        }
                        else res.status(500).send({message: 'Album does not exist'})
                    }
                    else res.status(500).send({message: 'Artist unknown'})
                }
                else res.status(500).send({message: 'Song name already exists'})
            }
        } catch (err) {
            console.log(err.stack)
        }
    }
}

export default router;