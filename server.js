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
import admin from './routes/adminRouter.js'
import path from 'path'
import bodyParser from 'body-parser'
import expressLayouts from 'express-ejs-layouts';
import ExpressFormidable from 'express-formidable';
const app = express();
const __dirname = path.resolve(path.dirname(''));
app.use(cookieParser())

app.set('views','views');
app.set('view engine','ejs');
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('layout extractScripts', true)
app.set('layout extractStyles', true)
app.use(expressLayouts);

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
//app.use(ExpressFormidable());

app.use(function(req, res, next){
	res.locals.ajax = req.xhr;
	const token = req.cookies.token
    if(token)
		res.locals.loggedIn = true;
	else
		res.locals.loggedIn = false;
	next();
})
app.use("/", user);
app.use("/account", account);
app.use("/artist", artist);
app.use("/song", song);
app.use("/playlist", playlist);
app.use("/album", album);
app.use("/rating", rating);
app.use("/comment", comment);
app.use("/admin", admin);



app.listen(5000, () => { console.log("Server started at http://localhost:5000")});