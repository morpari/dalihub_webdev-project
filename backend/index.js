const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
require('dotenv').config()
const postsRouter = require('./routes/posts')
const commentsRouter = require('./routes/comments')
const authRouter = require('./routes/auth');
const cors = require('cors');
const setupSwagger = require('./config/swagger');
const userRoutes = require("./routes/users");

const app = express()




app.use(cors({
    origin: process.env.FRONT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));


const port = process.env.PORT

app.use('/posts', postsRouter)
app.use('/comments', commentsRouter)
app.use('/auth', authRouter)
app.use("/users", userRoutes);

setupSwagger(app);

app.listen(port, () => {
    console.log(`app listening at port ${port}`);
})

