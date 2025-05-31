const express = require("express");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/authMiddleware");
require("dotenv").config();
const router = express.Router();
const multer = require('multer'); // For handling file uploads (speaker_wav)
const ttsController = require("../controllers/ttsController");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Make sure 'uploads/' directory exists in your backend root
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });


// 🔹 Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// 🔹 @route POST /api/users/register
// 🔹 @desc Register new user
router.post(
    "/register",
    asyncHandler(async (req, res) => {
        const { username, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user (password will be hashed automatically by the model)
        const user = await User.create({ username, email, password });

        if (user) {
            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    })
);

// 🔹 @route POST /api/users/login
// 🔹 @desc Authenticate user & get token
router.post(
    "/login",
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check if entered password matches the hashed password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user.id),
        });
    })
);

router.post("/voicegen", protect, upload.single('speaker_wav'), ttsController.generateVoice);

// 🔹 @route GET /api/users/profile
// 🔹 @desc Get user profile (protected route)
router.get(
    "/profile",
    protect,
    asyncHandler(async (req, res) => {
        res.json(req.user);
    })
);

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post(
    "/google-login",
    asyncHandler(async (req, res) => {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }

        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
        } catch (error) {
            return res.status(401).json({ message: "Invalid Google token" });
        }

        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        if (!email) {
            return res.status(400).json({ message: "Google account email not found" });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user with random password
            user = await User.create({
                username: name,
                email,
                password: googleId, // or generate a random password
            });
        }

        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user.id),
        });
    })
);

module.exports = router;
