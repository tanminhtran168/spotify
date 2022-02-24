import express from 'express'
import pg from 'pg'
import config from '../config.js'
import { convertIntToTimeString, saveFile, isImage } from '../utils.js'
import path from 'path'
import fs from 'fs'
const __dirname = path.resolve(path.dirname(''));
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
    const album_id = req.body.album_id
    try {
        const songs = await pool.query('SELECT song.*, artist_name, album_name, album_image FROM song, artist, album WHERE song.artist_id = artist.artist_id and song.album_id = album.album_id and album.album_id = $1', [album_id])
        songs.rows.forEach(row => {
            row.duration = convertIntToTimeString(row.duration)
        })
        res.send(songs.rows)
    } catch (err) {
        console.log(err.stack)
    }
}
export const post_getAlbumbyId = async (req, res) => {
    const album_id = req.params.albumId
    try {
        const album = await pool.query('SELECT album.*, artist_name FROM album, artist WHERE album_id = $1 and album.artist_id = artist.artist_id', [album_id])
        album.rows[0].total_duration = convertIntToTimeString(album.rows[0].total_duration)
        res.locals.data = album.rows[0]
    } catch (err) {
        console.log(err.stack)
    }
    try {
        const songs = await pool.query('SELECT song.*, artist_name, album_name, album_image FROM song, artist, album WHERE song.artist_id = artist.artist_id and song.album_id = album.album_id and album.album_id = $1', [album_id])
        songs.rows.forEach(row => {
            row.duration = convertIntToTimeString(row.duration)
        })
        res.locals.songs = songs.rows
    } catch (err) {
        console.log(err.stack)
    }
    res.render('album')
}

export const get_searchAlbum = async (req, res) => {
    res.render('albumViews/searchInfo')
}
export const post_searchAlbum = async (req, res) => {
    var {key_word} = req.body
    key_word = "%" + key_word + "%"
    try {
        var album = await pool.query('SELECT album.*, artist_name FROM album, artist WHERE album_name LIKE $1 and artist.artist_id = album.artist_id', [key_word])
        if(album.rowCount) res.send(album.rows)
        else res.status(500).send({message: 'We cound not found anything matching your keyword'})
    } catch (err) {
        console.log(err.stack)
    }    
}
export const get_addNewAlbum = async (req, res) => {
    res.render('albumViews/addNewAlbum')
}
const uploadFolder = path.join(__dirname, "public","images", "albumImages");
export const post_addNewAlbum = async (req, res) => {
    const {album_name, artist_name, album_info} = req.fields
    const {album_image} = req.files
    if(album_image != null) {
        if(!isImage(album_image)) {
            res.status(500).send({message: 'Wrong file format'}) 
            return
        }
    }

    try {
        if (album_name == '' || artist_name == '') res.status(500).send({message: 'Missing some value'}) 
        else {
            var name = await pool.query('SELECT album_name FROM album WHERE album_name = $1', [album_name])
            if (name.rowCount == 0) {
                // Lấy artist
                var artist = await pool.query('SELECT artist_id FROM artist WHERE artist_name = $1', [artist_name])
                if (artist.rowCount) {
                    if(album_image == null) {
                        var image_link = '/images/album.png'
                    }
                    else {
                        var image_link = '/images/albumImages/' + album_name + '.jpg'
                        const imageName = album_name + '.jpg'
                        saveFile(album_image, uploadFolder, imageName)
                    }
                    var artist_id = artist.rows[0].artist_id
                    var update = await pool.query('UPDATE artist SET num_of_albums = num_of_albums + 1, last_updated_stamp = current_timestamp WHERE artist_id = $1;', [artist_id])
                    var album = await pool.query('INSERT INTO album(album_id, artist_id, album_name, album_image, album_info, num_of_songs, total_duration, last_updated_stamp, created_stamp) \
                        VALUES(default, $1, $2, $3, $4, 0, 0, current_timestamp, default) RETURNING *', [artist_id, album_name, image_link, album_info])
                    if (album.rowCount) {
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
        var album = await pool.query('SELECT artist_id, num_of_songs FROM album WHERE album_id = $1', [album_id])
        if (album.rowCount == 0) return res.status(500).send({message: 'Album ID does not exist'})
        var artist_id = album.rows[0].artist_id
        var num_of_songs = album.rows[0].num_of_songs
        // Xóa các bài hát trong album cần xóa có trong song_added_to_playlist
        var song = await pool.query('SELECT song_id, duration FROM song WHERE album_id = $1', [album_id])
        var x = 0
        while(x < song.rowCount) {
            var song_id = song.rows[x].song_id
            var duration = song.rows[x].duration
            var playlist = await pool.query('SELECT playlist_id FROM song_added_to_playlist WHERE song_id = $1', [song_id])
            // Cập nhật num_of_songs trong playlist
            var y = 0
            while(y < playlist.rowCount) {
                var playlist_id = playlist.rows[y].playlist_id
                var update = await pool.query('UPDATE playlist SET num_of_songs = num_of_songs - 1, total_duration = total_duration - $2, last_updated_stamp = current_timestamp WHERE playlist_id = $1', [playlist_id, duration])
                y += 1
            }
            await pool.query('DELETE FROM song_added_to_playlist WHERE song_id = $1', [song_id])
            // Xóa rating, comment của bài hát trong album cần xóa
            await pool.query('DELETE FROM rating WHERE song_id = $1', [song_id])
            await pool.query('DELETE FROM comment WHERE song_id = $1', [song_id])
            x += 1
        }
        // Xóa các bài hát có album_id
        var delSong = await pool.query('DELETE FROM song WHERE album_id = $1', [album_id])
        // Xóa album bằng album_id
        var delAlbum = await pool.query('DELETE FROM album WHERE album_id = $1', [album_id])
        // Cập nhật num_of_albums
        var update = await pool.query('UPDATE artist SET num_of_albums = num_of_albums - 1, num_of_songs = num_of_songs - $2, last_updated_stamp = current_timestamp WHERE artist_id = $1;', [artist_id, num_of_songs])
        if (delAlbum.rowCount) {
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
    var {album_id, album_name, artist_name, album_info} = req.fields
    const {album_image} = req.files
    if(album_image)
    if(!isImage(album_image)) {
        res.status(500).send({message: 'Wrong file format'})
        return
    } 
    try {
        var old_db = await pool.query('SELECT * FROM album WHERE album_id = $1', [album_id])
        if(old_db.rowCount == 0) res.status(500).send({message: 'Album does not exist'})
        else {
            if(album_name == '') album_name = old_db.rows[0].album_name
            //if(album_image == '') album_image = old_db.rows[0].album_image
            if(album_info == '') album_info = old_db.rows[0].album_info
            var albumname_db = await pool.query('SELECT album_name FROM album WHERE album_name = $1', [album_name])
            if(albumname_db.rowCount == 0 || album_name == old_db.rows[0].album_name) {
                var old_artist = await pool.query('SELECT * FROM artist WHERE artist_id = $1', [old_db.rows[0].artist_id])
                var new_artist
                if(artist_name == '') new_artist = old_artist 
                else new_artist = await pool.query('SELECT * FROM artist WHERE artist_name = $1', [artist_name])
                if(new_artist.rowCount) {
                    // Cập nhật num_of_albums, num_of_songs trong artist
                    await pool.query('UPDATE artist SET num_of_albums = num_of_albums - 1, num_of_songs = num_of_songs - $2, last_updated_stamp = current_timestamp WHERE artist_id = $1', [old_artist.rows[0].artist_id, old_db.rows[0].num_of_songs])
                    await pool.query('UPDATE artist SET num_of_albums = num_of_albums + 1, num_of_songs = num_of_songs + $2, last_updated_stamp = current_timestamp WHERE artist_id = $1', [new_artist.rows[0].artist_id, old_db.rows[0].num_of_songs])
                    // Cập nhật album
                    var image_link = '/images/albumImages/' + album_name + '.jpg'
                    const imageName = album_name + '.jpg'
                    if(album_image)
                        saveFile(album_image, uploadFolder, imageName)
                    var album = pool.query('UPDATE album SET album_name = $2, artist_id = $3, album_image = $4, album_info = $5, last_updated_stamp = current_timestamp WHERE album_id = $1', [album_id, album_name, new_artist.rows[0].artist_id, image_link, album_info])
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