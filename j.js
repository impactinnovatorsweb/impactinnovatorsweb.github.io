const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://ylearn9945:sami123@codeimpactstudies.e5xam.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Middleware to verify token (Now only from request body)
const verifyToken = (req, res, next) => {
    const token = req.body.token; // Only checking the body now

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, "1234kamransami%^!23341hellow"); // Use your secret key
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid token." });
    }
};

// Example protected route
app.post('/protected', verifyToken, (req, res) => {
    res.json({ message: "Access granted!", user: req.user });
});

// Create HTTP server
const server = http.createServer(app);

// Start server
const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
