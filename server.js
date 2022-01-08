import express from 'express';
import user from './routes/userRouter.js'
import account from './routes/accountRouter.js'
import artist from './routes/artistRouter.js'
import song from './routes/songRouter.js'
import playlist from './routes/playlistRouter.js'
import album from './routes/albumRouter.js'

const app = express();

app.set('views','views');
app.set('view engine','ejs');
app.use(express.static('public'));

//app.use("/", (req, res)=> {res.render('homepage')})
app.get('/', (req, res) => {
	res.render('main')
})


app.use("/", user);
app.use("/account", account);
app.use("/artist", artist);
app.use("/song", song);
//app.use("/playlist", playlist);
//app.use("/album", album);

app.listen(5000, () => { console.log("Server started at http://localhost:5000")});