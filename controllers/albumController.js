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

export const get_getAlbumInfo = async (req, res) => {
    res.render('albumViews/searchInfo')
}
export const post_getAlbumInfo = async (req, res) => {
    console.log(req.body)
    const {album_name, artist_name} = req.body
    try {
        var album = await pool.query('SELECT * FROM album WHERE album_name = $1 or artist_id = (SELECT artist_id FROM artist WHERE artist_name = $2 LIMIT 1)', [album_name, artist_name])
    } catch (err) {
        console.log(err.stack)
    }    
    res.send(album.rows)
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
            if (name.rows[0] == null) {
                // Lấy artist
                var artist = await pool.query('SELECT artist_id FROM artist WHERE artist_name = $1 LIMIT 1', [artist_name])
                
                if (artist.rowCount) {
                    var album = await pool.query('INSERT INTO album(album_id, artist_id, album_name, album_image, album_info, num_of_songs, total_duration, last_updated_stamp, created_stamp) \
                        VALUES(default, (SELECT artist_id FROM artist WHERE artist_name = $2 LIMIT 1), $1, $3, $4, 0, 0, current_timestamp, default) RETURNING *', [album_name, artist_name, album_image, album_info])
                    
                    if (album.rowCount) {
                        var artist_id = artist.rows[0].artist_id

                        // Cập nhật num_of_albums
                        var update = await pool.query('UPDATE artist SET num_of_albums = num_of_albums + 1 WHERE artist_id = $1;', [artist_id])
            
                        // Trả kết quả
                        // Trả kết quả
                        if (update.rowCount) {
                            res.status(201).send({message: 'Album added and #Album updated successfully'});
                        } else {
                            res.status(500).send({message: 'Error in updating number of albums'})
                        }
                    } else {
                        res.status(500).send({message: 'Error in added new album'});
                    }
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
    const album_id = req.body.id;
    try {
        // Lấy artist_id để cập nhật num_of_albums
        var artist = await pool.query('SELECT artist_id FROM album WHERE album_id = $1', [album_id])
        if (artist.rowCount == 0) {
            res.status(500).send({message: 'Album ID does not exist'})
        }
        var artist_id = artist.rows[0].artist_id
        
        // Xóa album bằng album_id
        var album = await pool.query('DELETE FROM album WHERE album_id = $1', [album_id])
        // var album = 0;

        // Xóa các bài hát có album_id
        await pool.query('DELETE FROM song WHERE album_id = $1', [album_id])

        // Nếu xóa thành công album
        if (album.rowCount) {
            // Cập nhật num_of_albums
            var update = await pool.query('UPDATE artist SET num_of_albums = num_of_albums - 1 WHERE artist_id = $1;', [artist_id])
            
            // Trả kết quả
            if (update.rowCount) {
                res.status(201).send({message: 'Album deleted and #Album updated successfully'});
            } else {
                res.status(500).send({message: 'Error in updating number of albums'})
            }

        } else {
            res.status(500).send({message: 'Error in deleting album'})
        }
    } catch (err) {
        console.log(err.stack)
    }
}

export const albumUpdateNumofSongs = async (album_name) => {
    try {
        var album = pool.query('UPDATE album SET num_of_songs = (SELECT COUNT song_id FROM song, album WHERE song.album_id = album.album_id and album_name = $1), total_duration = (SELECT SUM(duration) FROM song, album WHERE song.album_id = album.album_id and album_name = $1), , last_updated_timestamp =  current_timestamp WHERE album_name = $1', [album_name])
        if (album) res.status(201).send({message: 'Update successful'})
        else res.status(500).send({message: 'Error in updating'})
} catch (err) {
        console.log(err.stack)
    }
}
export const updateAlbum = async (req, res) => {

}

export default router;