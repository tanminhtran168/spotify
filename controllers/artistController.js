import express from 'express'
import pg from 'pg'
import config from '../config.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getAllArtist = async (req, res) => {
    try {
        var artist = await pool.query('SELECT * FROM artist')
    } catch (err) {
        console.log(err.stack)
    }
    res.send(artist.rows)
}

export const get_getArtistInfo = async (req, res) => {
    res.render('artistViews/searchInfo')
}
export const post_getArtistInfo = async (req, res) => {
    console.log(req.body)
    const {artist_name} = req.body
    try {
        var artist = await pool.query('SELECT * FROM artist WHERE artist_name = $1', [artist_name])
    } catch (err) {
        console.log(err.stack)
    }    
    res.send(artist.rows)
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
            if(name.rows[0] == null) {
                var artist = await pool.query('INSERT INTO artist(artist_id, artist_name, artist_info, artist_image, birth_date, num_of_albums, num_of_songs, last_updated_stamp, created_stamp) \
                    VALUES(default, $1, $2, $3, $4, 0, 0, current_timestamp, default) RETURNING *', [artist_name, artist_info, artist_image, birth_date])
                if (artist) {
                    res.status(201).send({message: 'New artist added'});
                } else {
                    res.status(500).send({message: 'Error in added new artist'});
                }
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
    const artist_id = req.body.id;

    try {
        await pool.query('DELETE FROM song WHERE artist_id = $1', [artist_id])
        await pool.query('DELETE FROM album WHERE artist_id = $1', [artist_id])
        var artist = await pool.query('DELETE FROM artist WHERE artist_id = $1', [artist_id])
        if (artist.rowCount) {
            res.status(201).send({message: 'Artist deleted'});
        } else {
            res.status(500).send({message: 'Artist ID does not exist'});
        }
    } catch (err) {
        console.log(err.stack)
    }
}

export const artistUpdateNumofSongs = async (artist_id) => {
    try {
        var artist = pool.query('UPDATE artist SET num_of_albums = num_of_albums + 1 WHERE artist_id = $1;', [artist_id])
    } catch (err) {
        console.log(err.stack)
    }
    if (artist) {
        console.log('Update successful')
    }
    else {
        console.log('Error in updating')
    }
}


export const updateArtist = async (req, res) => {
}

export default router;