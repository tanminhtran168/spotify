import express from 'express'
import pg from 'pg'
import config from '../config.js'
import { getClient, convertIntToTimeString, saveFile, isImage } from '../utils.js';
import path from 'path'
const __dirname = path.resolve(path.dirname(''));
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
    const artist_id = req.params.artistId
    try {
        var artist = await pool.query('SELECT * FROM artist WHERE artist_id = $1', [artist_id])
        res.locals.data = artist.rows[0];
    } catch (err) {
        console.log(err.stack)
    } 

    try {
        var song = await pool.query('SELECT song.*, artist_name, album_name FROM song, artist, album WHERE song.artist_id = artist.artist_id and song.album_id = album.album_id and artist.artist_id = $1', [artist_id])
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
    res.render('artist')
}

export const get_searchArtist = async (req, res) => {
    res.render('artistViews/searchInfo')
}
export const post_searchArtist = async (req, res) => {
    var {key_word} = req.body
    key_word = "%" + key_word + "%"
    try {
        var artist = await pool.query('SELECT * FROM artist WHERE artist_name LIKE $1', [key_word])
        if(artist.rowCount) res.send(artist.rows)
        else res.status(500).send({message: 'We cound not found anything matching your keyword'})
    } catch (err) {
        console.log(err.stack)
    }    
}

const uploadFolder = path.join(__dirname, "public","images", "artistImages");
export const get_addNewArtist = async (req, res) => {
    res.render('artistViews/addNewArtist')
}
export const post_addNewArtist = async (req, res) => {
    const {artist_name, birth_date, artist_info} = req.fields
    const {artist_image} = req.files
    if(!isImage(artist_image)) {
        res.status(500).send({message: 'Wrong file format'}) 
        return
    }
    try {
        if(artist_name == '' || birth_date == '' ) res.status(500).send({message: 'Missing some value'})
        else {
            var name = await pool.query('SELECT artist_name FROM artist WHERE artist_name = $1', [artist_name])
            if(name.rowCount == 0) {
                var image_link = '/images/artistImages/' + artist_name + '.jpg'
                const imageName = artist_name + '.jpg'
                saveFile(artist_image, uploadFolder, imageName)
                var artist = await pool.query('INSERT INTO artist(artist_id, artist_name, artist_info, artist_image, birth_date, num_of_albums, num_of_songs, last_updated_stamp, created_stamp) \
                    VALUES(default, $1, $2, $3, $4, 0, 0, current_timestamp, default) RETURNING *', [artist_name, artist_info, image_link, birth_date])
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
        var song = await pool.query('SELECT song_id, duration FROM song WHERE artist_id = $1', [artist_id])
        var x = 0
        while(x < song.rowCount) {
            var song_id = song.rows[x].song_id
            var duration = song.rows[x].duration
            var playlist = await pool.query('SELECT playlist_id FROM song_added_to_playlist WHERE song_id = $1', [song_id])
            // Cập nhật num_of_songs trong playlist
            var y = 0
            while(y < playlist.rowCount) {
                var playlist_id = playlist.rows[y].playlist_id
                await pool.query('UPDATE playlist SET total_duration = total_duration - $2, num_of_songs = num_of_songs - 1, last_updated_stamp = current_timestamp WHERE playlist_id = $1', [playlist_id, duration])
                y += 1
            }
            await pool.query('DELETE FROM song_added_to_playlist WHERE song_id = $1', [song_id])
            // Xóa rating, comment của bài hát trong artist cần xóa
            await pool.query('DELETE FROM rating WHERE song_id = $1', [song_id])
            await pool.query('DELETE FROM comment WHERE song_id = $1', [song_id])
            x += 1
        }
        // Xóa các bài hát có artist_id
        await pool.query('DELETE FROM song WHERE artist_id = $1', [artist_id])
        // Xóa các album có artist_id
        await pool.query('DELETE FROM album WHERE artist_id = $1', [artist_id])
        var client = await pool.query('SELECT client_id FROM artist_favorite WHERE artist_id = $1', [artist_id])
        // Xóa artist_favorite có artist_id
        await pool.query('DELETE FROM artist_favorite WHERE artist_id = $1', [artist_id])
        // Cập nhật num_artist_favorite của các client
        var x = 0;
        while(x < client.rowCount) {
            await pool.query('UPDATE client SET num_artist_favorite = num_artist_favorite - 1 WHERE client_id = $1), last_updated_stamp = current_timestamp WHERE client_id = $1', [client.rows[0].client_id])
            await pool.query('UPDATE account SET last_updated_stamp = current_timestamp WHERE account_id = (SELECT account_id FROM client WHERE client_id = $1 LIMIT 1)', [client.rows[0].client_id])
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
    var {artist_id, artist_name, birth_date, artist_info} = req.fields
    const {artist_image} = req.files
    if(!isImage(artist_image)) {
        res.status(500).send({message: 'Wrong file format'}) 
        return
    }
    try {
        var old_db = await pool.query('SELECT * FROM artist WHERE artist_id = $1', [artist_id])
        if(old_db.rowCount == 0) res.status(500).send({message: 'Artist does not exist'})
        else {
            if(artist_name == '') artist_name = old_db.rows[0].artist_name
            //if(artist_image == '') artist_image = old_db.rows[0].artist_image
            if(birth_date == '') birth_date = old_db.rows[0].birth_date
            if(artist_info == '') artist_info = old_db.rows[0].artist_info
            var image_link = '/images/artistImages/' + artist_name + '.jpg'
            const imageName = artist_name + '.jpg'
            saveFile(artist_image, uploadFolder, imageName)
            var artistname_db = await pool.query('SELECT artist_name FROM artist WHERE artist_name = $1', [artist_name])
            if(artistname_db.rowCount == 0 || artist_name == old_db.rows[0].artist_name) {
                var artist = pool.query('UPDATE artist SET artist_name = $2, artist_image = $3, birth_date = $4, artist_info = $5, last_updated_stamp = current_timestamp WHERE artist_id = $1', [artist_id, artist_name, image_link, birth_date, artist_info])
                if (artist.rowCount) res.status(201).send({message: 'Artist updated'})
                else res.status(500).send({message: 'Error in updating artist'})
            }
            else res.status(500).send({message: 'Artist name already exists'})
        }
    } catch (err) {
        console.log(err.stack)
    }
}

export const getAllArtistFavorite = async(req, res) => {
    const client_id = await getClient(req, res)
    if(client_id == -1) res.status(500).send({message: 'You are admin'})
    else
        if(client_id) {
            const artist = await pool.query('SELECT artist.* from artist, artist_favorite WHERE artist.artist_id = artist_favorite.artist_id and client_id = $1', [client_id])
            if(artist.rowCount) res.send(artist.rows)
            else res.status(500).send({message: 'Error in getting your favorite artist list'})
        }
}

export const get_addArtistFavorite = async(req, res) => {
    res.render('artistViews/addArtistFavorite')
}
export const post_addArtistFavorite = async(req, res) => {
    const {artist_id} = req.body
    const client_id = await getClient(req, res)
    if(client_id == -1) res.status(500).send({message: 'You are admin'})
    else
        if(client_id) {
            const artist = await pool.query('SELECT artist_id FROM artist_favorite WHERE client_id = $1 and artist_id = $2', [client_id, artist_id])
            if(artist.rowCount) res.status(500).send({message: 'This artist has been added to your artist favorite list'})
            else {
                const favorite = await pool.query('INSERT INTO artist_favorite(client_id, artist_id, created_stamp) VALUES ($1, $2, default)', [client_id, artist_id])
                const updateNum = await pool.query('UPDATE client SET num_artist_favorite = num_artist_favorite + 1 WHERE client_id = $1', [client_id])
                if(favorite.rowCount) {
                    if(updateNum.rowCount) res.status(201).send({message: 'Add artist favorite successful'})
                    else res.status(500).send({message: 'Error in updating number of artist favorite'})
                }
                else res.status(500).send({message: 'Error in adding artist favorite'})
            }
        }
}

export const get_deleteArtistFavorite = async(req, res) => {
    res.render('artistViews/delArtistFavorite')
}
export const post_deleteArtistFavorite = async(req, res) => {
    const {artist_id} = req.body
    const client_id = await getClient(req, res)
    if(client_id == -1) res.status(500).send({message: 'You are admin'})
    else
        if(client_id) { 
            const artist = await pool.query('SELECT artist_id FROM artist_favorite WHERE client_id = $1 and artist_id = $2', [client_id, artist_id])
            if(artist.rowCount) {
                const favorite = await pool.query('DELETE FROM artist_favorite WHERE client_id = $1 and artist_id = $2', [client_id, artist_id])
                const updateNum = await pool.query('UPDATE client SET num_artist_favorite = num_artist_favorite - 1 WHERE client_id = $1', [client_id])
                if(favorite) {
                    if(updateNum) res.status(201).send({message: 'Delete artist favorite successful'})
                    else res.status(500).send({message: 'Error in updating number of artist favorite'})
                }
            }
            else res.status(500).send({message: 'This artist is not in your artist favorite list'})
        } 
        else res.status(500).send({message: 'Error in deleting artist'})
}

export default router;