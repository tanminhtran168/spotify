import express from 'express'
import pg from 'pg'
import jwt from 'jsonwebtoken'
import config from '../config.js'
import { convertIntToTimeString } from '../utils.js'
import {readFile, readFileSync} from 'fs'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const get_homepage = async (req, res) => {
    var numsong= await pool.query('SELECT COUNT(song_id) as numsong FROM song')
    res.locals.num_of_song = numsong.rows[0].numsong
    var numalbum = await pool.query('SELECT COUNT(album_id) as numalbum FROM album')
    res.locals.num_of_album = numalbum.rows[0].numalbum
    var numartist = await pool.query('SELECT COUNT(artist_id) as numartist FROM artist')
    res.locals.num_of_artist = numartist.rows[0].numartist
    var numclient = await pool.query('SELECT COUNT(client_id) as numclient FROM client')
    res.locals.num_of_client = numclient.rows[0].numclient
    var tmp = readFileSync('public/views.txt') 
    res.locals.viewcount = tmp
    res.render('admin/homepage', {layout: 'admin/layout'}) 
}

export const get_song_manage = async (req, res) => {
    try{
        const songs = await pool.query('SELECT song.*, artist_name, album_name, album_image FROM song, artist, album WHERE song.artist_id = artist.artist_id and song.album_id = album.album_id')
        songs.rows.forEach(row => {
            row.duration = convertIntToTimeString(row.duration)
        })
        res.locals.songs = songs.rows
    } catch (err) {
        console.log(err.stack)
    }
    
    res.render('admin/manage-song', {layout: 'admin/layout'}) 
}
export const get_artist_manage = async (req, res) => {
    try {
        var artist = await pool.query('SELECT * FROM artist')
        res.locals.artists = artist.rows
    } catch (err) {
        console.log(err.stack)
    }    
    res.render('admin/manage-artist', {layout: 'admin/layout'}) 
}
export const get_album_manage = async (req, res) => {
    try {
        var album = await pool.query('SELECT album.*, artist_name FROM album, artist WHERE artist.artist_id = album.artist_id')
        res.locals.albums = album.rows
    } catch (err) {
        console.log(err.stack)
    }    
    res.render('admin/manage-album', {layout: 'admin/layout'}) 
}
export const get_single_song = async (req, res) => {
    const song_id = req.params.songId
    try {
        var song = await pool.query('SELECT song.*, artist_name, album_name, album_image FROM song, artist, album WHERE song.artist_id = artist.artist_id and song.album_id = album.album_id and song_id = $1', [song_id])
        //res.send(song.rows)
        //console.log(song.rows[0])
        res.locals.data = song.rows[0]
        res.locals.rating = Math.round(song.rows[0].sum_rate / song.rows[0].num_of_ratings)
        
    } catch (err) {
        console.log(err.stack)
    }   

    try {
        const comment = await pool.query('SELECT full_name, comment_content, avatar FROM comment, client, account WHERE song_id = $1 and comment.client_id = client.client_id and account.account_id = client.account_id', [song_id])
        res.locals.comments = comment.rows
    } catch (err) {
        console.log(err.stack)
    }

    res.render('admin/song', {layout: 'admin/layout'})
}
export const get_update_song = async(req, res) => {
    const song_id = req.params.songId
    try {
        var song = await pool.query('SELECT song.*, artist_name, album_name, album_image FROM song, artist, album WHERE song.artist_id = artist.artist_id and song.album_id = album.album_id and song_id = $1', [song_id])
        //res.send(song.rows)
        //console.log(song.rows[0])
        res.locals.data = song.rows[0]
        res.locals.rating = Math.round(song.rows[0].sum_rate / song.rows[0].num_of_ratings)
        
    } catch (err) {
        console.log(err.stack)
    }   

    try {
        const comment = await pool.query('SELECT full_name, comment_content FROM comment, client, account WHERE song_id = $1 and comment.client_id = client.client_id and account.account_id = client.account_id', [song_id])
        res.locals.comments = comment.rows
        //console.log(comment.rows)
    } catch (err) {
        console.log(err.stack)
    }

    res.render('admin/edit-song', {layout: 'admin/layout'})
}
export const getNumSong = async (req, res) => {
    const num = await pool.query('SELECT COUNT(song_id) as numsong FROM song')
    res.send(num.rows[0].numsong)
}

export const getNumAlbum = async (req, res) => {
    const num = await pool.query('SELECT COUNT(album_id) as numalbum FROM album')
    res.send(num.rows[0].numalbum)
}

export const getNumArtist = async (req, res) => {
    const num = await pool.query('SELECT COUNT(artist_id) as numartist FROM artist')
    res.send(num.rows[0].numartist)
}

export const getNumClient = async (req, res) => {
    const num = await pool.query('SELECT COUNT(client_id) as numclient FROM client')
    res.send(num.rows[0].numclient)
}
export const get_album = async (req, res) => {
    res.render('admin/album', {layout: 'admin/layout'})
}
export const get_add_album = async (req, res) => {
    res.render('admin/add-album', {layout: 'admin/layout'})
}
export const get_add_artist = async (req, res) => {
    res.render('admin/add-artist', {layout: 'admin/layout'})
}
export const get_add_song = async (req, res) => {
    res.render('admin/add-song', {layout: 'admin/layout'})
}
export const get_update_artist = async (req, res) => {
    const artist_id = req.params.artistId
    try {
        var artist = await pool.query('SELECT * FROM artist WHERE artist_id = $1', [artist_id])
        res.locals.data = artist.rows[0];
    } catch (err) {
        console.log(err.stack)
    } 
    res.render('admin/edit-artist', {layout: 'admin/layout'})
}
export const get_update_album = async (req, res) => {
    const album_id = req.params.albumId
    try {
        const album = await pool.query('SELECT album.*, artist_name FROM album, artist WHERE album_id = $1 and album.artist_id = artist.artist_id', [album_id])
        album.rows[0].total_duration = convertIntToTimeString(album.rows[0].total_duration)
        res.locals.data = album.rows[0]
    } catch (err) {
        console.log(err.stack)
    }
    res.render('admin/edit-album', {layout: 'admin/layout'})
}
export const get_single_album = async (req, res) => {
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
    res.render('admin/album', {layout: 'admin/layout'})
}
export const get_single_artist = async (req, res) => {
    const artist_id = req.params.artistId
    try {
        var artist = await pool.query('SELECT * FROM artist WHERE artist_id = $1', [artist_id])
        res.locals.data = artist.rows[0];
    } catch (err) {
        console.log(err.stack)
    } 

    try {
        var song = await pool.query('SELECT song.*, artist_name, album_name, album_image FROM song, artist, album WHERE song.artist_id = artist.artist_id and song.album_id = album.album_id and artist.artist_id = $1', [artist_id])
        song.rows.forEach(row => {
            row.duration = convertIntToTimeString(row.duration)
        })
        res.locals.songs = song.rows;
    } catch (err) {
        console.log(err.stack)
    } 

    try {
        var album = await pool.query('SELECT album.*, artist_name FROM album, artist WHERE album.artist_id = artist.artist_id and artist.artist_id = $1', [artist_id])
        res.locals.albums = album.rows;
    } catch (err) {
        console.log(err.stack)
    } 
    res.render('admin/artist', {layout: 'admin/layout'})
}