import express from 'express'
import pg from 'pg'
import jwt from 'jsonwebtoken'
import config from '../config.js'

export const get_homepage = async (req, res) => {
    res.render('admin/homepage', {layout: 'admin/layout'}) 
}