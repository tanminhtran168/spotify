import express from 'express'
import pg from 'pg'
import config from '../config.js'
import { artistUpdateNumofAlbums} from './artistController.js'
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
        var artist = await pool.query('SELECT artist_id FROM artist WHERE artist_name = $1 LIMIT 1', [artist_name]) 
        if(artist) {
            var album = await pool.query('INSERT INTO album(album_id, artist_id, album_name, album_image, album_info, birth_date, num_of_songs, total_duration, last_updated_stamp, created_stamp) \
                VALUES(default, (SELECT artist_id FROM artist WHERE artist_name = $2 LIMIT 1), $1, $3, $4, null, 0, null, default) RETURNING *', [album_name, artist_name, album_image, album_info])
            //console.log(req)
            if (album) {
                res.status(201).send({message: 'New album added'});
                artistUpdateNumofAlbums(artist_name)
            } else {
                res.status(500).send({message: 'Error in added new album'});
            }
        }
        else res.status(500).send({message: 'Artist unknown'});
    } catch (err) {
        console.log(err.stack)
    }
}
export const get_deleteAlbum = async(req, res) => {
    res.render('albumViews/deleteAlbum')
} 
export const post_deleteAlbum = async (req, res) => {
    //console.log(req.body)
    const {album_id} = req.body
    try {
        var album = await pool.query('DELETE FROM album WHERE album_id = $1', [album_id])
        console.log('delete')
    } catch (err) {
        console.log(err.stack)
    }
    if (album) {
        res.status(201).send({message: 'Album deleted'});
        var artist = await pool.query('SELECT artist_name FROM artist, album WHERE artist.album_id = album.album_id')
        if (artist) {
            res.status(201).send({message: 'Update number of albums successful'})
            artistUpdateNumofAlbums(artist.rows[0].artist_name)
        }
        else res.status(500).send({message: 'Error in updating number of albums'})
    } else {
        res.status(500).send({message: 'Error in deleting album'})
    }
}

export const albumUpdateNumofSongs = async (album_name) => {
    try {
        var album1 = pool.query('UPDATE album SET num_of_songs = (SELECT COUNT song_id FROM song, album WHERE song.album_id = album.album_id and album_name = $1) WHERE album_name = $1', [album_name])
        var album2 = pool.query('UPDATE album SET total_duration = (SELECT SUM(duration) FROM song, album WHERE song.album_id = album.album_id and album_name = $1) WHERE album_name = $1', [album_name])
    } catch (err) {
        console.log(err.stack)
    }
    if (album1 && album2) {
        res.status(201).send({message: 'Update successful'})
    }
    else {
        res.status(500).send({message: 'Error in updating'})
    }
}
export const updateAlbum = async (req, res) => {

}

export default router;