import express from 'express'
import pg from 'pg'
import jwt from 'jsonwebtoken'
import config from '../config.js'
import { convertIntToTimeString, getClient, saveFile } from '../utils.js'
import path from 'path'
import ffprobe from 'ffprobe'
import ffprobeStatic from 'ffprobe-static'
const __dirname = path.resolve(path.dirname(''));
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)
router.use(express.static('public'));

export const getAllSong = async (req, res) => {
    try {
        var song = await pool.query('SELECT * FROM song')
        res.send(song.rows)
    } catch (err) {
        console.log(err.stack)
    }
}

export const get_getSongInfobyId = async (req, res) => {
    const {song_id} = req.body
    try {
        var song = await pool.query('SELECT song.*, artist_name, album_name FROM song, artist, album WHERE song.artist_id = artist.artist_id and song.album_id = album.album_id and song_id = $1', [song_id])
        song.rows[0].duration = convertIntToTimeString(song.rows[0].duration)
        //console.log(song.rows[0])
        res.send(song.rows[0])
    } catch (err) {
        console.log(err.stack)
    }    
}
export const post_getSongInfobyId = async (req, res) => {
    const song_id = req.params.songId
    try {
        var song = await pool.query('SELECT song.*, artist_name, album_name FROM song, artist, album WHERE song.artist_id = artist.artist_id and song.album_id = album.album_id and song_id = $1', [song_id])
        //res.send(song.rows)
        //console.log(song.rows[0])
        res.locals.data = song.rows[0]
        res.locals.rating = Math.round(song.rows[0].sum_rate / song.rows[0].num_of_ratings)
        const album = await pool.query('SELECT album_image FROM album WHERE album_id = $1', [song.rows[0].album_id])
        res.locals.album_image = album.rows[0].album_image
        
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
    const token = req.cookies.token
    if(token)
    {
        res.locals.loggedIn = true;
        var account_id
        jwt.verify(token, config.JWT_SECRET, (err, decode) => {
            if (err) return res.status(401).send({ message: 'Error in authentication' });
            account_id = decode.id
        })
        try {
            var playlists = await pool.query('SELECT playlist.* FROM playlist, client, account  WHERE playlist.client_id = client.client_id and account.account_id = client.account_id and account.account_id = $1', [account_id])
            res.locals.playlists = playlists.rows
        }
        catch (err) {
            console.log(err.stack)
        }    
    }
    else
        res.locals.loggedIn = false;

    res.render('song', {layout: 'layout'})
}

export const get_searchSong = async (req, res) => {
    res.render('songViews/searchInfo')
}
export const post_searchSong = async (req, res) => {
    var {key_word} = req.body
    key_word = "%" + key_word +  "%"
    try {
        var song = await pool.query('SELECT song.*, artist_name, album_name FROM song, artist, album WHERE song_name LIKE $1 and song.artist_id = artist.artist_id and song.album_id = album.album_id', [key_word])
        res.send(song.rows)
    } catch (err) {
        console.log(err.stack)
    }
}

export const searchCategory = async (req, res) => {
    var {key_word} = req.body
    key_word = "%" + key_word +  "%"
    try {
        var song = await pool.query('SELECT DISTINCT category FROM song WHERE category LIKE keyword', [key_word])
        res.send(song.rows)
    } catch (err) {
        console.log(err.stack)
    }    
}

export const get_addNewSong = async (req, res) => {
    res.render('songViews/addNewSong')
}
function isSong(file) {
    if(file.type.slice(0, 5) == 'audio') return true
    return false
}
const uploadFolder = path.join(__dirname, "public","songs");
export const post_addNewSong = async (req, res) => {
    var {song_name, artist_name, album_name, song_info, category} = req.fields;
    const {song_file} = req.files
    var duration
    if(!isSong(song_file)) {
        res.status(500).send({message: 'Wrong file format'}) 
        return
    }
    ffprobe(song_file.path, { path: ffprobeStatic.path }, function (err, info) {
        if (err) return err;
        duration = info.streams[0].duration;
    })
    if(song_name == '' || artist_name == '' || album_name == '' || category == '' )
        res.status(500).send({message: 'Missing some value'})
    else 
        try {
            // Kiểm tra tên bài hát có trùng không
            var name = await pool.query('SELECT * FROM song WHERE song_name = $1', [song_name])
            // Nếu artist này chưa có song nào cùng song_name
            if (name.rowCount == 0) {
                // Lấy thông tin artist
                var artist = await pool.query('SELECT artist_id FROM artist WHERE artist_name = $1', [artist_name])
                // Nếu artist tồn tại
                if (artist.rowCount) {
                    var artist_id = artist.rows[0].artist_id
                    var album = await pool.query('SELECT album_id FROM album WHERE album_name = $1 and artist_id = $2', [album_name, artist_id])
                    if (album.rowCount) {
                        var song_link = '/songs/' + song_name + '.mp3'
                        const songName = song_name + '.mp3'
                        saveFile(song_file, uploadFolder, songName)
                        var album_id = album.rows[0].album_id
                        var song = await pool.query('INSERT INTO song(song_id, artist_id, album_id, song_name, song_info, song_link, duration, category, sum_rate, num_of_ratings, num_of_comments, last_updated_stamp, created_stamp) \
                            VALUES(default, $1, $2, $3, $4, $5, $6, $7, 0, 0, 0, current_timestamp, default) RETURNING *', [artist_id, album_id, song_name, song_info, song_link, duration, category])
                        if (song.rowCount) {
                            // Lấy artist_id và album_id để cập nhật
                            var artist_id = artist.rows[0].artist_id
                            var album_id = album.rows[0].album_id
                            // Cập nhật num_of_albums
                            var update_artist = await pool.query('UPDATE artist SET num_of_songs = num_of_songs + 1, last_updated_stamp = current_timestamp WHERE artist_id = $1;', [artist_id])
                            var update_album_songs = await pool.query('UPDATE album SET num_of_songs = num_of_songs + 1, last_updated_stamp = current_timestamp WHERE album_id = $1;', [album_id])
                            var update_album_duration = await pool.query('UPDATE album SET total_duration = total_duration + $1, last_updated_stamp = current_timestamp WHERE album_id = $2;', [duration, album_id])
                            // Trả kết quả
                            if (update_artist.rowCount && update_album_songs.rowCount && update_album_duration.rowCount) {
                                res.status(201).send({message: 'Song added. artist & album updated successfully'});
                            } else res.status(500).send({message: 'Error in updating artist and album'})
                        } 
                        else res.status(500).send({message: 'Error in added new song'});
                    }        
                    else res.status(500).send({message: 'Album does not exist'});
                }
                else res.status(500).send({message: 'Artist unknown'});
            }
            else res.status(500).send({message: 'Song name of this artist already exists'})
        } catch (err) {
            console.log(err.stack)
        }
}
export const get_deleteSong = async(req, res) => {
    res.render('songViews/deleteSong')
} 
export const post_deleteSong = async (req, res) => {
    const {song_id} = req.body;
    try {
        var song = await pool.query('SELECT artist_id, album_id, duration FROM song WHERE song_id = $1', [song_id])
        if (song.rowCount == 0) res.status(500).send({message: 'Song ID does not exist'})
        var artist_id = song.rows[0].artist_id
        var album_id = song.rows[0].album_id
        var duration = song.rows[0].duration
        var playlist = await pool.query('SELECT playlist_id FROM song_added_to_playlist WHERE song_id = $1', [song_id])
        // Cập nhật num_of_songs trong playlist
        var y = 0
        while(y < playlist.rowCount) {
            var playlist_id = playlist.rows[y].playlist_id
            await pool.query('UPDATE playlist SET total_duration = total_duration - $1, num_of_songs = num_of_songs - 1, last_updated_stamp = current_timestamp WHERE playlist_id = $2', [duration, playlist_id])
            y += 1
        }
        // Cập nhật num_of_songs, duration
        var update_artist = await pool.query('UPDATE artist SET num_of_songs = num_of_songs - 1, last_updated_stamp = current_timestamp WHERE artist_id = $1;', [artist_id])
        var update_album = await pool.query('UPDATE album SET num_of_songs = num_of_songs - 1, last_updated_stamp = current_timestamp WHERE album_id = $1;', [album_id])
        var update_album_duration = await pool.query('UPDATE album SET total_duration = total_duration - $1, last_updated_stamp = current_timestamp WHERE album_id = $2;', [duration, album_id])
        var delSongaddedtoPlaylist = await pool.query('DELETE FROM song_added_to_playlist WHERE song_id = $1', [song_id])
        // Xóa rating, comment của bài hát
        var delRating = await pool.query('DELETE FROM rating WHERE song_id = $1', [song_id])
        var delComment = await pool.query('DELETE FROM comment WHERE song_id = $1', [song_id])
        // Xóa song
        var song = await pool.query('DELETE FROM song WHERE song_id = $1', [song_id])
        if(song.rowCount) res.status(201).send({message: 'Song deleted'});
        else res.status(500).send({message: 'Error in deleting song'});
    } catch (err) {
        console.log(err.stack)
    }
}
export const get_updateSong = async (req, res) => {
    res.render('songViews/updateSong')
}
export const post_updateSong = async (req, res) => {
    var {song_id, song_name, artist_name, album_name, song_info, category} = req.fields
    const {song_file} = req.files
    var duration
    if(!isSong(song_file)) {
        res.status(500).send({message: 'Wrong file format'}) 
        return
    }
    ffprobe(song_file.path, { path: ffprobeStatic.path }, function (err, info) {
        if (err) return err;
        duration = info.streams[0].duration;
    })
    if(song_id == '') res.status(500).send({message: 'Song does not exist'})
    else {
        try {
            var old_db = await pool.query('SELECT * FROM song WHERE song_id = $1', [song_id])
            if(old_db.rowCount == 0) res.status(500).send({message: 'Song does not exist'})
            else {
                if(song_name == '') song_name = old_db.rows[0].song_name
                //if(song_link == '') song_link = old_db.rows[0].song_link
                if(song_info == '') song_info = old_db.rows[0].song_info
                //if(duration == '') duration = old_db.rows[0].duration
                if(category == '') category = old_db.rows[0].category
                var songname_db = await pool.query('SELECT song_name FROM song WHERE song_name = $1', [song_name])
                if(songname_db.rowCount == 0 || song_name == old_db.rows[0].song_name) {
                    var old_artist = await pool.query('SELECT * FROM artist WHERE artist_id = $1', [old_db.rows[0].artist_id])
                    var new_artist
                    if(artist_name == '') new_artist = old_artist 
                    else new_artist = await pool.query('SELECT * FROM artist WHERE artist_name = $1', [artist_name])
                    if(new_artist.rowCount) {
                        var old_album = await pool.query('SELECT * FROM album WHERE album_id = $1', [old_db.rows[0].album_id])
                        var new_album
                        if(album_name == '') new_album = old_album 
                        else new_album = await pool.query('SELECT * FROM album WHERE album_name = $1', [album_name])
                        if(new_album.rowCount) {
                            if(new_album.rows[0].artist_id == new_artist.rows[0].artist_id) {
                                // Cập nhật num_of_songs trong artist
                                await pool.query('UPDATE artist SET num_of_songs = num_of_songs - 1, last_updated_stamp = current_timestamp WHERE artist_id = $1', [old_artist.rows[0].artist_id])
                                await pool.query('UPDATE artist SET num_of_songs = num_of_songs + 1, last_updated_stamp = current_timestamp WHERE artist_id = $1', [new_artist.rows[0].artist_id])
                                // Cập nhật num_of_songs, duration trong album
                                await pool.query('UPDATE album SET num_of_songs = num_of_songs - 1, last_updated_stamp = current_timestamp WHERE album_id = $1', [old_album.rows[0].album_id])
                                await pool.query('UPDATE album SET num_of_songs = num_of_songs + 1, last_updated_stamp = current_timestamp WHERE album_id = $1', [new_album.rows[0].album_id])
                                await pool.query('UPDATE album SET total_duration = total_duration - $1, last_updated_stamp = current_timestamp WHERE album_id = $2;', [old_db.rows[0].duration, old_album.rows[0].album_id])
                                await pool.query('UPDATE album SET total_duration = total_duration + $1, last_updated_stamp = current_timestamp WHERE album_id = $2;', [duration, new_album.rows[0].album_id])
                                var playlist = await pool.query('SELECT playlist_id FROM song_added_to_playlist WHERE song_id = $1', [song_id])
                                var x = 0;
                                while(x < playlist.rowCount) {
                                    await pool.query('UPDATE playlist SET total_duration = total_duration - $1 + $2, last_updated_stamp = current_timestamp WHERE playlist_id = $3;', [old_db.rows[0].duration, duration, playlist.rows[x].playlist_id])
                                    x += 1
                                }
                                var song_link = 'public/songs' + song_name + '.mp3'
                                const songName = song_name + '.mp3'
                                saveFile(song_file, uploadFolder, songName)
                                // Cập nhật song
                                var song = pool.query('UPDATE song SET artist_id = $2, album_id = $3, song_name = $4, song_info = $5, song_link = $6, duration = $7, category = $8, last_updated_stamp = current_timestamp WHERE song_id = $1', [song_id, new_artist.rows[0].artist_id, new_album.rows[0].album_id, song_name, song_info, song_link, duration, category])
                                if (song) res.status(201).send({message: 'Song updated'})
                                else res.status(500).send({message: 'Error in updating song'})
                            }
                            else res.status(500).send({message: 'Album does not exist'})
                        }
                        else res.status(500).send({message: 'Album does not exist'})
                    }
                    else res.status(500).send({message: 'Artist unknown'})
                }
                else res.status(500).send({message: 'Song name already exists'})
            }
        } catch (err) {
            console.log(err.stack)
        }
    }
}

export const addNewRecentlyListenedSong = async (req, res) => {
    const {song_id} = req.body
    const client_id = await getClient(req, res)
    const song = await pool.query('SELECT * FROM song WHERE song_id = $1 and client_id = $2', [song_id, client_id])
    if(song == null) {
        const latest_song = await pool.query('SELECT * FROM recently_listened WHERE client_id = $1 ORDER BY created_stamp ASC', [client_id])
        const num = await pool.query('SELECT COUNT(song_id) as num FROM recently_listened WHERE client_id = $1', [client_id])
        if(num.rows[0].num == 10) await pool.query('DELETE FROM recently_listened WHERE client_id = $1 and song_id = $2', [client_id, latest_song.rows[0].song_id])
        await pool.query('INSERT INTO recently_listened(song_id, client_id, created_stamp) \ VALUES ($1, $2, default)', [song_id, client_id])
    }
    else {
        await pool.query('DELETE FROM recently_listened WHERE client_id = $1 and song_id = $2', [client_id, latest_song.rows[0].song_id])
        await pool.query('INSERT INTO recently_listened(song_id, client_id, created_stamp) \ VALUES ($1, $2, default)', [song_id, client_id])
    }
}

export const getRecentlyListenedSong = async (req, res) => {
    const client_id = getClient(req, res)
    const song = await pool.query('SELECT * FROM recently_listened WHERE client_id = $1 ORDER BY created_stamp DESC', [client_id])
    res.send(song.rows)
}

export default router;