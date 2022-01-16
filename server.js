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
import bodyParser from 'body-parser'
const app = express();
const __dirname = path.resolve(path.dirname(''));
app.use(cookieParser())

app.set('views','views');
app.set('view engine','ejs');
app.use(express.static('public'));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use("/user/", user);
app.use("/account", account);
app.use("/artist", artist);
app.use("/song", song);
app.use("/playlist", playlist);
app.use("/album", album);
app.use("/rating", rating);
app.use("/comment", comment);
app.get("/ejs/:filename", (req, res)=>{
	res.sendFile(path.join(__dirname, `views/${req.params.filename}.ejs`));
})
app.get("/login", (req, res) => {
	res.render('login');
})
app.get("/signup", (req, res) => {
	res.render('signup');
})
app.get("/*", (req, res) => {
	res.render('main');
})


app.listen(5000, () => { console.log("Server started at http://localhost:5000")});