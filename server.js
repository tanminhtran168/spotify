import express from 'express';
import user from './routes/userRouter.js'
import account from './routes/accountRouter.js'
import artist from './routes/artistRouter.js'
import song from './routes/songRouter.js'
import playlist from './routes/playlistRouter.js'
import album from './routes/albumRouter.js'
import cookieParser from 'cookie-parser';
import rating from './routes/ratingRouter.js'
import comment from './routes/commentRouter.js'
import path from 'path'
const app = express();
const __dirname = path.resolve(path.dirname(''));
app.use(cookieParser())

app.set('views','views');
app.set('view engine','ejs');
app.use(express.static('public'));

//for frontend testing
/*
app.get("/login", (req, res) => {
	res.render('userViews/login');
})
*/

app.get("/*", (req, res) => {
	res.render('main');
})



app.use("/", user);
app.use("/account", account);
app.use("/artist", artist);
app.use("/song", song);
app.use("/playlist", playlist);
app.use("/album", album);
app.use("/rating", rating);
app.use("/comment", comment);

app.listen(5000, () => { console.log("Server started at http://localhost:5000")});