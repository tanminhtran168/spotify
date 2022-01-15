import express from 'express'
import pg from 'pg'
import config from '../config.js'
import { getClient } from '../utils.js';
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getAllRating = async (req, res) => {
    var rating = await pool.query('SELECT * FROM rating')
    res.status(201).send(rating.rows)
}

export const getAllMyRating = async (req, res) => {
    const client_id = await getClient(req, res)
    if(client_id == -1) res.status(500).send({message: 'You are admin'})
    else 
        if(client_id) {
            try {
                var rating = await pool.query('SELECT * FROM rating WHERE client_id = $1', [client_id])
                if(rating) res.status(201).send(rating.rows)
                else res.status(500).send({message: 'Error in get all rating'})
            } catch (err) {
                console.log(err.stack)
            }
        }
}

export const get_getAllRatingofSong = async (req, res) => {
    res.render('ratingViews/getAllRatingofSong')
}
export const post_getAllRatingofSong = async (req, res) => {
    const {song_id} = req.body
    try {
        var rating = await pool.query('SELECT * FROM rating WHERE song_id = $1', [song_id])
        if(rating) res.status(201).send(rating.rows)
        else res.status(500).send({message: 'Error in get all rating'})
    } catch (err) {
        console.log(err.stack)
    }
}

export const get_addNewRating = async (req, res) => {
    res.render('ratingViews/addNewRating')
}
export const post_addNewRating = async (req, res) => {
    const {song_id, rating} = req.body
    const client_id = await getClient(req, res)
    if(client_id == -1) res.status(500).send({message: 'You are admin'})
    else 
        if(client_id) {
            if(rating.length != 1 || rating[0] > '5' || rating[0] < '1') {
                res.status(500).send({message: 'Rating must be between 1 - 5 stars'})
                return
            }
            var update = await pool.query('UPDATE song SET sum_rate = sum_rate + $2, num_of_ratings = num_of_ratings + 1, last_updated_stamp = current_timestamp WHERE song_id = $1', [song_id, rating])
            var rate = await pool.query('INSERT INTO rating(rating_id, client_id, song_id, rating, last_updated_stamp, created_stamp) VALUES (default, $1, $2, $3, current_timestamp, default)', [client_id, song_id, rating])
            if(rate.rowCount) {
                if(update.rowCount) res.status(201).send({message: 'Add new rating successful'})
                else res.status(500).send({message: 'Error in updating rating'})
            }
            else res.status(500).send({message: 'Error in adding rating'})
        }
}

export const get_getSongRating = async(req, res) => {
    res.render('ratingViews/getRating')
}
export const post_getSongRating = async(req, res) => {
    const {song_id} = req.body
    var song = await pool.query('SELECT sum_rate, num_of_ratings FROM song WHERE song_id = $1', [song_id])
    if(song.rowCount) {
        var rate = song.rows[0].sum_rate / song.rows[0].num_of_ratings
        res.status(201).send({rate})
    }
    else res.status(500).send({message: 'Error in geting rating'})
}

export const get_deleteRating = async (req, res) => {
    res.render('ratingViews/deleteRating')
}
export const post_deleteRating = async (req, res) => {
    const {rating_id} = req.body
    const song = await pool.query('SELECT song_id, client_id, rating FROM rating WHERE rating_id = $1', [rating_id])
    const client_id = await getClient(req, res)
    if(client_id == -1 || client_id == song.rows[0].client_id) {
        const update = await pool.query('UPDATE song SET sum_rate = sum_rate - $2, num_of_ratings = num_of_ratings - 1, last_updated_stamp = current_timestamp WHERE song_id = $1', [song.rows[0].song_id, song.rows[0].rating])
        const rate = await pool.query('DELETE FROM rating WHERE rating_id = $1', [rating_id])
        if(rate.rowCount) {
            if(update.rowCount) res.status(201).send({message: 'Delete rating successful'})
            else res.status(500).send({message: 'Error in updating rating'})
        }
        else res.status(500).send({message: 'Error in deleting rating'})
    }
    else res.status(500).send({message: 'You are not have permission to do this'})
}

export const get_getSongbyRating = async (req, res) => {
    res.render('ratingViews/getSongbyRating')
}
export const post_getSongbyRating = async (req, res) => {
    const {quantity} = req.body
    const song = await pool.query('SELECT song.*, (sum_rate/num_of_ratings) as rate FROM song, rating ORDER BY rating DESC LIMIT $1', [quantity])
    res.send(song.rows)
}

export default router;