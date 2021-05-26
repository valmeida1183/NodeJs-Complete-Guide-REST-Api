const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const mongoDbConnect = require('./db/mongoDbConnect');
const { fileStorage, fileFilter } = require('./middlewares/fileStorage.middleware');

// Routes
const feedRoutes = require('./routes/feed.route');
const authRoutes = require('./routes/auth.route');

const app = express();

//Set CORS configuration to any client
app.use((req, res, next) => {
    // Set any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Set HTTP methods allowed
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    // Set allowed headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});

// Configure json parser middleware
app.use(express.json());
//Configure multer middleware
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
// Configure to serve static files inside 'images' folder
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

//Global error handling
app.use((error, req, res, next) => {
    console.log(error);
    const { statusCode, message } = error || 500;
    res.status(statusCode).json({ message });
});

mongoose
    .connect(mongoDbConnect.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(8000);
        console.log(
            '\x1b[32m', // set green color
            '--------- Application is Running!!! ---------'
        );
        console.log('\x1b[0m');
    })
    .catch(err => console.log(err));