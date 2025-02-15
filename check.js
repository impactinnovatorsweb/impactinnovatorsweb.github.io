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

// Middleware to Verify Token from Body
const verifyToken = (req, res, next) => {
    let token = req.body.token || req.header("Authorization") || req.query.token;

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        token = token.startsWith("Bearer ") ? token.split(" ")[1] : token; // Remove "Bearer" correctly
        console.log("Final Token for Verification:", token);

        const decoded = jwt.verify(token, "1234kamransami%^!23341hellow");
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT Error:", err.message);
        res.status(400).json({ message: "Invalid token." });
    }
};

// Lecture Schema
const lectureSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    status: { type: String, required: true },
    institute: { type: String, required: true },
    topic: { type: String, required: true },
    level: { type: String, required: true },
    user: { type: String, required: true } // Store user ID
});

const Lecture = mongoose.model('Lecture', lectureSchema);

// Create a new lecture (Token in Body)
app.post('/lectures/create', verifyToken, async (req, res) => {
    try {
        const { id, url, status, institute, topic, level } = req.body;

        const newLecture = new Lecture({
            id,
            url,
            status,
            institute,
            topic,
            level,
            user: req.user._id // User ID extracted from token
        });

        await newLecture.save();
        res.status(201).send(newLecture);
    } catch (error) {
        res.status(400).send({ message: "Error creating lecture", error });
    }
});

// Get all lectures (Public)
app.get('/lectures/read', async (req, res) => {
    try {
        const lectures = await Lecture.find();
        res.status(200).send(lectures);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a lecture by ID (Public)
app.get('/lectures/read/:id', async (req, res) => {
    try {
        const lecture = await Lecture.findOne({ id: req.params.id });
        if (!lecture) return res.status(404).send({ message: 'Lecture not found' });
        res.status(200).send(lecture);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a lecture (Protected: Only the creator can update)
app.put('/lectures/update/:id', verifyToken, async (req, res) => {
    try {
        const lecture = await Lecture.findOne({ id: req.params.id });
        if (!lecture) return res.status(404).send({ message: "Lecture not found" });

        if (lecture.user !== req.user._id) {
            return res.status(403).send({ message: "Unauthorized action" });
        }

        const updatedLecture = await Lecture.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        res.status(200).send(updatedLecture);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a lecture (Protected: Only the creator can delete)
app.delete('/lectures/delete/:id', verifyToken, async (req, res) => {
    try {
        const lecture = await Lecture.findOne({ id: req.params.id });
        if (!lecture) return res.status(404).send({ message: "Lecture not found" });

        if (lecture.user !== req.user._id) {
            return res.status(403).send({ message: "Unauthorized action" });
        }

        await Lecture.findOneAndDelete({ id: req.params.id });
        res.status(200).send({ message: "Lecture deleted successfully" });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
