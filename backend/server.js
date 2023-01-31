const express = require('express')
const app = express();
const cors = require('cors')
require("dotenv").config();

const vaccines = require('./routes/vaccines');
const users = require("./routes/users");
const auth = require("./routes/auth");



const mongoose = require('mongoose')
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000'
}))

app.use('/vaccines', vaccines);
app.use("/users", users);
app.use("/signin", auth);
app.use('/uploads', express.static('uploads'));


mongoose.connect('mongodb://mongodb:27017/docker-vaccines');

const db = mongoose.connection

db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to database'))

app.listen(port, () => {
    console.log(`Server up at ${port}`)
  });