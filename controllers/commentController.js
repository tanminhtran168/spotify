import express from 'express'
import pg from 'pg'
import config from '../config.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const post_getAllCommentbyClient = async (req, res) => {
    const {client_id} = req.body
    try {
        var comment = await pool.query('SELECT * FROM comment WHERE client_id = $1', [client_id])
        if(comment) res.status(201).send(comment.rows)
        else res.status(500).send({message: 'Error in get all comment'})
    } catch (err) {
        console.log(err.stack)
    }
}

export const post_getAllCommentbySong = async (req, res) => {
    const {song_id} = req.body
    try {
        var comment = await pool.query('SELECT * FROM comment WHERE song_id = $1', [song_id])
        if(comment) res.status(201).send(comment.rows)
        else res.status(500).send({message: 'Error in get all comment'})
    } catch (err) {
        console.log(err.stack)
    }
}

export const getCommentInfo = async(req, res) => {
    const {comment_id} = req.body
    var comment = await pool.query('SELECT * FROM comment WHERE comment_id = $1', [comment_id])
    if(comment) {
        res.send(comment.rows)
    }
    else res.status(500).send({message: 'Error in geting comment'})
}

export const get_addNewComment = async (req, res) => {
    res.render('commentViews/addNewComment')
}
export const post_addNewComment = async (req, res) => {
    const {client_id, song_id, comment_content} = req.body
    var comment = await pool.query('INSERT INTO comment(comment_id, client_id, song_id, comment_content, last_updated_stamp, created_stamp) VALUES (default, $1, $2, $3, null, default)', [client_id, song_id, comment_content])
    if(comment) {
        var change = await pool.query('UPDATE song SET num_of_comment = (SELECT COUNT comment_id FROM comment WHERE song_id = $1) WHERE song_id = $1', [song_id])
        if(change) res.status(201).send({message: 'Update number of comment in song successful'})
        else res.status(500).send({message: 'Error in updating number of comment in song'})
        res.status(201).send({message: 'Add new comment successful'})
    }
    else res.status(500).send({message: 'Error in adding comment'})
}

export const get_deleteComment = async (req, res) => {
    res.render('commentViews/deleteComment')
}
export const post_deleteComment = async (req, res) => {
    const {comment_id, song_id} = req.body
    var comment = await pool.query('DELETE FROM comment WHERE comment_id = $1', [comment_id])
    if(comment) {
        res.status(201).send({message: 'Delete comment successful'})
        var change = await pool.query('UPDATE song SET num_of_comment = (SELECT COUNT comment_id FROM comment WHERE song_id = $1) WHERE song_id = $1', [song_id])
        if(change) res.status(201).send({message: 'Update number of comment in song successful'})
        else res.status(500).send({message: 'Error in updating number of comment in song'})
    }
    else res.status(500).send({message: 'Error in adding comment'})
}

export const get_editComment = async (req, res) => {
    res.render('commentViews/editComment')
}
export const post_editComment = async (req, res) => {
    const {comment_id, comment_content} = req.body
    var comment = await pool.query('UPDATE comment SET comment_content = $2 WHERE comment_id = $1', [comment_id, comment_content])
    if(comment) {
        res.status(201).send({message: 'Edit comment successful'})
    }
    else res.status(500).send({message: 'Error in editing comment'})
}

export const getNumCommentinSong = async (req, res) => {
    const {song_id} = req.body
    var comment = await pool.query('SELECT num_of_comments FROM song WHERE song_id = $1 LIMIT 1', [song_id])
    if(comment) {
        res.status(201).send(comment.rows[0].num_of_comments)
    }
    else res.status(500).send('Error in getting number of comments')
}

export default router;