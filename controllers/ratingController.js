import express from 'express'
import pg from 'pg'
import config from '../config.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const post_getAllRatingbyClient = async (req, res) => {
    const {client_id} = req.body
    try {
        var rating = await pool.query('SELECT * FROM rating WHERE client_id = $1', [client_id])
        if(rating) res.status(201).send(rating.rows)
        else res.status(500).send({message: 'Error in get all rating'})
    } catch (err) {
        console.log(err.stack)
    }
}

export const post_getAllRatingbySong = async (req, res) => {
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
    const {client_id, song_id, rating} = req.body
    var rate = await pool.query('INSERT INTO rating(rating_id, client_id, song_id, rating, last_updated_stamp, created_stamp) VALUES (default, $1, $2, $3, current_timestamp, default)', [client_id, song_id, rating])
    if(rate) {
        res.status(201).send({message: 'Add new rating successful'})
        var sum = await pool.query('UPDATE song SET sum_rate = (SELECT SUM(rating) FROM rating WHERE song_id = $1) WHERE song_id = $1', [song_id])
        var num = await pool.query('UPDATE song SET num_of_ratings = (SELECT COUNT client_id FROM rating WHERE song_id = $1), last_updated_stamp = current_timestamp WHERE song_id = $1', [song_id])
        if(sum && num) res.status(201).send({message: 'Update rating successful'})
        else res.status(500).send({message: 'Error in updating rating'})
    }
    else res.status(500).send({message: 'Error in adding rating'})
}

export const getSongRating = async(req, res) => {
    const {song_id} = req.body
    var sum = await pool.query('SELECT sum_rate FROM song WHERE song_id = $1', [song_id])
    var num = await pool.query('SELECT num_of_ratings FROM song WHERE song_id = $1', [song_id])
    if(sum && num) {
        var rate = sum.rows[0].sum_rate / num.rows[0].num_of_rating
        res.send(rate)
    }
    else res.status(500).send({message: 'Error in geting rating'})
}

export const get_deleteRating = async (req, res) => {
    res.render('ratingViews/deleteRating')
}
export const post_deleteRating = async (req, res) => {
    const {rating_id} = req.body
    var rate = await pool.query('DELETE FROM rating WHERE rating_id = $1', [rating_id])
    if(rate) {
        res.status(201).send({message: 'Delete rating successful'})
        var sum = await pool.query('UPDATE song SET sum_rate = (SELECT SUM(rating) FROM rating WHERE song_id = $1) WHERE song_id = $1', [song_id])
        var num = await pool.query('UPDATE song SET num_of_ratings = (SELECT COUNT client_id FROM rating WHERE song_id = $1), last_updated_stamp = current_timestamp WHERE song_id = $1', [song_id])
        if(sum && num) res.status(201).send({message: 'Update rating successful'})
        else res.status(500).send({message: 'Error in updating rating'})
    }
    else res.status(500).send({message: 'Error in deleting rating'})
}

export default router;