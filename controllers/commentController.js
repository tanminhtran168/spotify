import express from 'express'
import pg from 'pg'
import config from '../config.js'
import { getClient } from '../utils.js';
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getAllCommentbyClient = async (req, res) => {
    const client_id = await getClient(req, res)
    if(client_id == -1) res.status(500).send({message: 'You are admin'})
    else 
        if(client_id) {
            try {
                const comment = await pool.query('SELECT * FROM comment WHERE client_id = $1', [client_id])
                if(comment) res.status(201).send(comment.rows)
                else res.status(500).send({message: 'Error in get all comment'})
            } catch (err) {
                console.log(err.stack)
            }
        }
}

export const get_getAllCommentofSong = async (req, res) => {
    res.render('commentViews/getAllCommentofSong')
}
export const post_getAllCommentofSong = async (req, res) => {
    const {song_id} = req.body
    try {
        const comment = await pool.query('SELECT * FROM comment WHERE song_id = $1', [song_id])
        if(comment.rowCount) res.status(201).send(comment.rows)
        else res.status(500).send({message: 'Error in get all comment'})
    } catch (err) {
        console.log(err.stack)
    }
}

export const get_getCommentInfo = async(req, res) => {
    res.render('commentViews/getInfo')
}
export const post_getCommentInfo = async(req, res) => {
    const {comment_id} = req.body
    const comment = await pool.query('SELECT * FROM comment WHERE comment_id = $1', [comment_id])
    if(comment.rowCount) res.send(comment.rows)
    else res.status(500).send({message: 'Error in geting comment'})
}

export const get_addNewComment = async (req, res) => {
    res.render('commentViews/addNewComment')
}
const badWord = ["abc", "bcd"]
export const post_addNewComment = async (req, res) => {
    const {song_id, comment_content} = req.body
    const client_id = await getClient(req, res)
    if(client_id == -1) res.status(500).send({message: 'You are admin'})
    else 
        if(client_id) {
            if(comment_content == '') res.status(500).send({message: 'You must type something'})
            else {
                var x = 0
                while(x < badWord.length) {
                    var banWord = ' ' + badWord[x] + ' '
                    if(comment_content.search(banWord) != -1) {
                        res.status(500).send({message: 'You have typed forbidden word'})
                        return
                    }
                    x += 1
                }
                const change = await pool.query('UPDATE song SET num_of_comments = num_of_comments + 1, last_updated_stamp = current_timestamp WHERE song_id = $1', [song_id])
                const comment = await pool.query('INSERT INTO comment(comment_id, client_id, song_id, comment_content, last_updated_stamp, created_stamp) VALUES (default, $1, $2, $3, current_timestamp, default)', [client_id, song_id, comment_content])
                if(comment.rowCount) {
                    if(change.rowCount) res.status(201).send({message: 'Add new comment successful'})
                    else res.status(500).send({message: 'Error in updating number of comment in song'})
                }
                else res.status(500).send({message: 'Error in adding comment'})
            }
        }
}

export const get_deleteComment = async (req, res) => {
    res.render('commentViews/deleteComment')
}
export const post_deleteComment = async (req, res) => {
    const {comment_id} = req.body
    const client_id = await getClient(req, res)
    const song = await pool.query('SELECT song_id, client_id FROM comment WHERE comment_id = $1', [comment_id])
    if(client_id == -1 || song.rows[0].client_id == client_id) {
        var comment = await pool.query('DELETE FROM comment WHERE comment_id = $1', [comment_id])
        var change = await pool.query('UPDATE song SET num_of_comments = num_of_comments - 1, last_updated_stamp = current_timestamp WHERE song_id = $1', [song.rows[0].song_id])
        if(comment.rowCount) {
            if(change.rowCount) res.status(201).send({message: 'Delete comment successful'})
            else res.status(500).send({message: 'Error in updating number of comment in song'})
        }
        else res.status(500).send({message: 'Error in adding comment'})
    }
    else res.status(500).send({message: 'You are not have permission to do this'})
}

export const get_editComment = async (req, res) => {
    res.render('commentViews/editComment')
}
export const post_editComment = async (req, res) => {
    const {comment_id, comment_content} = req.body
    const client_id = await getClient(req, res)
    const client = await pool.query('SELECT client_id FROM comment WHERE comment_id = $1', [comment_id])
    if(client_id == -1 || client.rows[0].client_id == client_id) {
        if(comment_content == '') res.status(500).send({message: 'You must type something'})
        else {
            var x = 0
            while(x < badWord.length) {
                var banWord = ' ' + badWord[x] + ' '
                if(comment_content.search(banWord) != -1) {
                    res.status(500).send({message: 'You have typed forbidden word'})
                    return
                }
                x += 1
            }
            const comment = await pool.query('UPDATE comment SET comment_content = $2, last_updated_stamp = current_timestamp WHERE comment_id = $1', [comment_id, comment_content])
            if(comment.rowCount) res.status(201).send({message: 'Edit comment successful'})
            else res.status(500).send({message: 'Error in editing comment'})
        }
    }
    else res.status(500).send({message: 'You are not have permission to do this'})
}

export const getNumCommentinSong = async (req, res) => {
    const {song_id} = req.body
    const comment = await pool.query('SELECT num_of_comments FROM song WHERE song_id = $1', [song_id])
    if(comment.rowCount) res.status(201).send(comment.rows[0].num_of_comments)
    else res.status(500).send('Error in getting number of comments')
}

export default router;