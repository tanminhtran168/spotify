import express from 'express'
import pg from 'pg'
import config from '../config.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getAllArtist = async (req, res) => {
    try {
        var artist = await pool.query('SELECT * FROM artist')
        res.send(artist.rows)
    } catch (err) {
        console.log(err.stack)
    }
}

export const get_getArtistInfobyId = async (req, res) => {
    res.render('artistViews/getInfobyId')
}
export const post_getArtistInfobyId = async (req, res) => {
    const {artist_id} = req.body
    try {
        var artist = await pool.query('SELECT * FROM artist WHERE artist_id = $1', [artist_id])
        res.send(artist.rows)
    } catch (err) {
        console.log(err.stack)
    }    
}

export const get_searchArtist = async (req, res) => {
    res.render('artistViews/searchInfo')
}
export const post_searchArtist = async (req, res) => {
    const {key_word} = req.body
    key_word = key_word + "%"
    try {
        var artist = await pool.query('SELECT * FROM artist WHERE artist_name LIKE $1', [key_word])
        res.send(artist.rows)
    } catch (err) {
        console.log(err.stack)
    }    
}

export const get_addNewArtist = async (req, res) => {
    res.render('artistViews/addNewArtist')
}
export const post_addNewArtist = async (req, res) => {
    const {artist_name, artist_image, birth_date, artist_info} = req.body
    try {
        if(artist_name == '' || birth_date == '' ) res.status(500).send({message: 'Missing some value'})
        else {
            var name = await pool.query('SELECT artist_name FROM artist WHERE artist_name = $1', [artist_name])
            if(name.rowCount == 0) {
                var artist = await pool.query('INSERT INTO artist(artist_id, artist_name, artist_info, artist_image, birth_date, num_of_albums, num_of_songs, last_updated_stamp, created_stamp) \
                    VALUES(default, $1, $2, $3, $4, 0, 0, current_timestamp, default) RETURNING *', [artist_name, artist_info, artist_image, birth_date])
                if (artist) res.status(201).send({message: 'New artist added'});
                else res.status(500).send({message: 'Error in added new artist'});
            }
            else res.status(500).send({message: 'Artist name already exists'})
        }
    } catch (err) {
        console.log(err.stack)
    }
}

export const get_deleteArtist = async(req, res) => {
    res.render('artistViews/deleteArtist')
} 
export const post_deleteArtist = async (req, res) => {
    const {artist_id} = req.body;
    try {
        var song = await pool.query('SELECT song_id FROM song WHERE artist_id = $1', [artist_id])
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
            // Xóa rating, comment của bài hát trong artist cần xóa
            var delRating = await pool.query('DELETE FROM rating WHERE song_id = $1', [song_id])
            var delComment = await pool.query('DELETE FROM comment WHERE song_id = $1', [song_id])
            x += 1
        }
        // Xóa các bài hát có artist_id
        var delSong = await pool.query('DELETE FROM song WHERE artist_id = $1', [artist_id])
        // Xóa các album có artist_id
        var delAlbum = await pool.query('DELETE FROM album WHERE artist_id = $1', [artist_id])
        var client = await pool.query('SELECT client_id FROM artist_favorite WHERE artist_id = $1', [artist_id])
        // Xóa artist_favorite có artist_id
        var delArtistFavorite = await pool.query('DELETE FROM artist_favorite WHERE artist_id = $1', [artist_id])
        // Cập nhật num_artist_favorite của các client
        var x = 0;
        while(x < client.rowCount) {
            var update = await pool.query('UPDATE client SET num_artist_favorite = (SELECT COUNT(artist_id) FROM artist_favorite WHERE client_id = $1), last_updated_stamp = current_timestamp WHERE client_id = $1', [client.rows[0].client_id])
            x += 1
        }    
        // Xóa artist
        var delArtist = await pool.query('DELETE FROM artist WHERE artist_id = $1', [artist_id])
        if (delArtist.rowCount) res.status(201).send({message: 'Artist deleted'});
        else res.status(500).send({message: 'Artist ID does not exist'});
    } catch (err) {
        console.log(err.stack)
    }
}

export const get_updateArtist = async (req, res) => {
    res.render('artistViews/updateArtist')
}
export const post_updateArtist = async (req, res) => {
    var {artist_id, artist_name, artist_image, birth_date, artist_info} = req.body
    try {
        var old_db = await pool.query('SELECT * FROM artist WHERE artist_id = $1', [artist_id])
        if(old_db.rowCount == 0) {
            res.status(500).send({message: 'Artist does not exist'})
        }
        else {
            if(artist_name == '') artist_name = old_db.rows[0].artist_name
            if(artist_image == '') artist_image = old_db.rows[0].artist_image
            if(birth_date == '') birth_date = old_db.rows[0].birth_date
            if(artist_info == '') artist_info = old_db.rows[0].artist_info
            var artistname_db = await pool.query('SELECT artist_name FROM artist WHERE artist_name = $1', [artist_name])
            if(artistname_db.rowCount == 0 || artist_name == old_db.rows[0].artist_name) {
                var artist = pool.query('UPDATE artist SET artist_name = $2, artist_image = $3, birth_date = $4, artist_info = $5, last_updated_stamp = current_timestamp WHERE artist_id = $1', [artist_id, artist_name, artist_image, birth_date, artist_info])
                if (artist) res.status(201).send({message: 'Artist updated'})
                else res.status(500).send({message: 'Error in updating artist'})
            }
            else res.status(500).send({message: 'Artist name already exists'})
        }
    } catch (err) {
        console.log(err.stack)
    }
}

export default router;