import express from 'express'
import pg from 'pg'
import config from '../config.js'
import { convertIntToTimeString } from '../utils.js'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const get_homepage = async (req, res) => {
    res.render('admin/homepage', {layout: 'admin/layout'}) 
}

export const get_song_manage = async (req, res) => {
    try{
        const songs = await pool.query('SELECT song.*, artist_name, album_name FROM song, artist, album WHERE song.artist_id = artist.artist_id and song.album_id = album.album_id')
        songs.rows.forEach(row => {
            row.duration = convertIntToTimeString(row.duration)
        })
        res.locals.songs = songs.rows
    } catch (err) {
        console.log(err.stack)
    }
    
    res.render('admin/manage-song', {layout: 'admin/layout'}) 
}