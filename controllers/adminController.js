import express from 'express'
import pg from 'pg'
import jwt from 'jsonwebtoken'
import config from '../config.js'
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const get_homepage = async (req, res) => {
    res.render('admin/homepage', {layout: 'admin/layout'}) 
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