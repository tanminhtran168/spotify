import express from 'express';
import account from './routes/account.js'

const app = express();

app.use("/api/account", account);

app.listen(5000, () => { console.log("Server started at http://localhost:5000")});