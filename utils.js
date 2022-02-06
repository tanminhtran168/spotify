import express from 'express'
import jwt from 'jsonwebtoken';
import config from './config.js';
import pg from 'pg'
const router = express.Router()
const Pool = pg.Pool
const pool = new Pool(config.POSTGRES_INFO)

export const getToken = async (user) => {
  return jwt.sign(
    {
      id: user.account_id,
      user_name: user.username,
      password: user.password,
      isAdmin: (user.user_role == 'admin'),
    },
    config.JWT_SECRET,
    {
      expiresIn: '48h',
    }
  );
};

export const isAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, config.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(401).send({ message: 'Error in authentication' });
      }
      //console.log(decode)
      next();
      return;
    });
  } 
  else res.status(401).send({ message: 'You must log in first' });
  
};

export const checkAdmin = async (req, res, next) => {
  const token = req.cookies.token;
  jwt.verify(token, config.JWT_SECRET, (err, decode) => {
    if (err) {
      return res.status(401).send({ message: 'Error in authentication' });
    }
    if(decode.isAdmin) return next();
    else res.status(401).send({ message: 'Only admin can do this' });
    });
};

export var getClient = async (req, res) => {
  var token = req.cookies.token
    var account_id = 0
    jwt.verify(token, config.JWT_SECRET, (err, decode) => {
        if (err) {
          res.status(401).send({ message: 'Error in authentication' }); 
          return 0
        }
        account_id = decode.id
    });
    if(account_id == 0) res.status(500).send('You must log in first') 
    else {
        var client = await pool.query('SELECT client_id FROM client WHERE account_id = $1', [account_id])
        if(client.rowCount) {
            var client_id = client.rows[0].client_id
            return client_id
        } 
        else {
          return -1
        }
    }
    return 0
}

export function convertIntToTimeString (x){
  if(Math.floor(x%60) < 10)
      return Math.floor(x/60) + ":0" + Math.floor(x%60);
  else
      return Math.floor(x/60) +":" + Math.floor(x%60);
}
//export { getToken, isAuth, checkAdmin, getClient };
export default router