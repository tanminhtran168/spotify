import express from 'express';
import user from './routes/userRouter.js'
import account from './routes/accountRouter.js'
import song from './routes/songRouter.js'
import playlist from './routes/playlistRouter.js'
import album from './routes/albumRouter.js'

const app = express();

app.use("/user", user);
app.use("/account", account);
//app.use("/song", song);
//app.use("/playlist", playlist);
//app.use("/album", album);
app.set('views','./backend/views');
app.set('view engine','ejs');
app.listen(5000, () => { console.log("Server started at http://localhost:5000")});