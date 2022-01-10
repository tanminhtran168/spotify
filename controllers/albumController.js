import express from 'express'
import pg from 'pg'
import config from '../config.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getAllAlbum = async (req, res) => {
    try {
        var album = await pool.query('SELECT * FROM album')
    } catch (err) {
        console.log(err.stack)
    }
    res.send(album.rows)
}

export const get_getAlbumbyId = async (req, res) => {
    res.render('albumViews/getInfobyId')
}
export const post_getAlbumbyId = async (req, res) => {
    const {album_id} = req.body
    try {
        var album = await pool.query('SELECT * FROM album WHERE album_id = $1', [album_id])
        res.send(album.rows)
    } catch (err) {
        console.log(err.stack)
    }
}

export const get_searchAlbum = async (req, res) => {
    res.render('albumViews/searchInfo')
}
export const post_searchAlbum = async (req, res) => {
    const {album_name, artist_name} = req.body
    try {
        var album = await pool.query('SELECT album_name, artist_name, album_image, album_info, num_of_songs, total_duration, last_updated_stamp, created_stamp FROM album WHERE album_name = $1 or (artist_name = $2 and artist.artist_id = album.artist_id)', [album_name, artist_name])
        res.send(album.rows)
    } catch (err) {
        console.log(err.stack)
    }    
}

export const get_addNewAlbum = async (req, res) => {
    res.render('albumViews/addNewAlbum')
}
export const post_addNewAlbum = async (req, res) => {
    const {album_name, artist_name, album_image, album_info} = req.body
    try {
        if (album_name == '' || artist_name == '') 
            res.status(500).send({message: 'Missing some value'}) 
        else {
            var name = await pool.query('SELECT album_name FROM album WHERE album_name = $1', [album_name])
            if (name.rowCount == 0) {
                // Lấy artist
                var artist = await pool.query('SELECT artist_id FROM artist WHERE artist_name = $1 LIMIT 1', [artist_name])
                if (artist.rowCount) {
                    var artist_id = artist.rows[0].artist_id
                    var album = await pool.query('INSERT INTO album(album_id, artist_id, album_name, album_image, album_info, num_of_songs, total_duration, last_updated_stamp, created_stamp) \
                        VALUES(default, $1, $2, $3, $4, 0, 0, current_timestamp, default) RETURNING *', [artist_id, album_name, album_image, album_info])
                    if (album.rowCount) {
                        // Cập nhật num_of_albums
                        var update = await pool.query('UPDATE artist SET num_of_albums = num_of_albums + 1, last_updated_stamp = current_timestamp WHERE artist_id = $1;', [artist_id])
                        // Trả kết quả
                        if (update.rowCount) res.status(201).send({message: 'Album added and #Album updated successfully'});
                        else res.status(500).send({message: 'Error in updating number of albums'})
                    } 
                    else res.status(500).send({message: 'Error in adding new album'});
                }
                else res.status(500).send({message: 'Artist unknown'});
            }
            else res.status(500).send({message: 'Album name already exists'})
        }
    } catch (err) {
        console.log(err.stack)
    }
}

export const get_deleteAlbum = async(req, res) => {
    res.render('albumViews/deleteAlbum')
} 
export const post_deleteAlbum = async (req, res) => {
    const {album_id} = req.body;
    try {
        // Lấy artist_id để cập nhật num_of_albums
        var artist = await pool.query('SELECT artist_id FROM album WHERE album_id = $1', [album_id])
        if (artist.rowCount == 0) res.status(500).send({message: 'Album ID does not exist'})
        var artist_id = artist.rows[0].artist_id
        // Xóa các bài hát trong album cần xóa có trong song_added_to_playlist
        var song = await pool.query('SELECT song_id FROM song WHERE album_id = $1', [album_id])
        var x = 0
        while(x < song.rowCount) {
            var song_id = song.rows[x].song_id
            var playlist = await pool.query('SELECT playlist_id FROM song_added_to_playlist WHERE song_id = $1', [song_id])
            // Cập nhật num_of_songs trong playlist
            var y = 0
            while(y < playlist.rowCount) {
                var playlist_id = playlist.rows[y].playlist_id
                var update = await pool.query('UPDATE playlist SET num_of_songs = num_of_songs - 1, last_updated_stamp = current_timestamp WHERE playlist_id = $1', [playlist_id])
                y += 1
            }
            var delSongaddedtoPlaylist = await pool.query('DELETE FROM song_added_to_playlist WHERE song_id = $1', [song_id])
            // Xóa rating, comment của bài hát trong album cần xóa
            var delRating = await pool.query('DELETE FROM rating WHERE song_id = $1', [song_id])
            var delComment = await pool.query('DELETE FROM comment WHERE song_id = $1', [song_id])
            x += 1
        }
        // Xóa các bài hát có album_id
        var delSong = await pool.query('DELETE FROM song WHERE album_id = $1', [album_id])
        // Xóa album bằng album_id
        var delAlbum = await pool.query('DELETE FROM album WHERE album_id = $1', [album_id])
        // Nếu xóa thành công album
        if (delAlbum.rowCount) {
            // Cập nhật num_of_albums
            var update = await pool.query('UPDATE artist SET num_of_albums = num_of_albums - 1, last_updated_stamp = current_timestamp WHERE artist_id = $1;', [artist_id])
            // Trả kết quả
            if (update.rowCount) res.status(201).send({message: 'Album deleted and #Album updated successfully'});
            else res.status(500).send({message: 'Error in updating number of albums'})
        } 
        else res.status(500).send({message: 'Error in deleting album'})
    } catch (err) {
        console.log(err.stack)
    }
}
export const get_updateAlbum = async (req, res) => {
    res.render('albumViews/updateAlbum')
}
export const post_updateAlbum = async (req, res) => {
    var {album_id, album_name, artist_name, album_image, album_info} = req.body
    try {
        var old_db = await pool.query('SELECT * FROM album WHERE album_id = $1', [album_id])
        if(old_db.rowCount == 0) res.status(500).send({message: 'Album does not exist'})
        else {
            if(album_name = '') album_name = old_db.rows[0].album_name
            if(artist_name = '') artist_name = old_db.rows[0].artist_name
            if(album_image = '') album_image = old_db.rows[0].album_image
            if(album_info = '') album_info = old_db.rows[0].album_info
            var albumname_db = await pool.query('SELECT album_name FROM album WHERE album_name = $1', [album_name])
            if(albumname_db.rowCount == 0 || album_name == old_db.rows[0].album_name) {
                var old_artist = await pool.query('SELECT * FROM artist WHERE artist_id = $1', [old_db.rows[0].artist_id])
                var new_artist
                if(artist_name = '') new_artist = old_artist 
                else new_artist = await pool.query('SELECT * FROM artist WHERE artist_name = $1', [artist_name])
                //console.log(new_artist)
                if(new_artist.rowCount) {
                    // Cập nhật num_of_albums
                    await pool.query('UPDATE artist SET num_of_albums = num_of_album - 1 WHERE artist_id = $1, last_updated_stamp = current_timestamp', [old_artist.rows[0].artist_id])
                    await pool.query('UPDATE artist SET num_of_albums = num_of_album + 1 WHERE artist_id = $1, last_updated_stamp = current_timestamp', [new_artist.rows[0].artist_id])
                    // Cập nhật album
                    var album = pool.query('UPDATE album SET album_name = $2, artist_id = $3, album_image = $4, album_info = $5, last_updated_stamp = current_timestamp WHERE album_id = $1', [album_id, album_name, new_artist.rows[0].artist_id, album_image, album_info])
                    if (album) res.status(201).send({message: 'Album updated'});
                    else res.status(500).send({message: 'Error in updating album'});
                }
                else res.status(500).send({message: 'Artist unknown'})
            }
            else res.status(500).send({message: 'Album name already exists'})
        }
    } catch (err) {
        console.log(err.stack)
    }
}

export default router;