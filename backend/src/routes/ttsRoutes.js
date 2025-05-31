const express = require("express");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Setup multer with filename and folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "..", "..", "uploads");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

router.post("/test-upload", upload.single("file"), (req, res) => {
    console.log("File received:", req.file);
    res.json({ message: "File uploaded", file: req.file });
});

// POST /api/tts/synthesize
router.post("/synthesize", upload.single("speaker_wav"), async (req, res) => {
    try {
        console.log("req.body:", req.body);
        console.log("req.file:", req.file);
        if (!req.file) {
            return res.status(400).json({ message: "No speaker_wav file uploaded." });
        }

        const formData = new FormData();
        formData.append("text", req.body.text);
        formData.append("language", req.body.language?.trim());
        formData.append(
            "speaker_wav",
            fs.createReadStream(req.file.path),
            {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            }
        );
        console.log("Sending to FastAPI:", {
            text: req.body.text,
            language: req.body.language,
            filePath: req.file.path
        });


        const fastApiResponse = await axios.post(
            "http://localhost:8000/synthesize/",
            formData,
            {
                headers: formData.getHeaders(),
                responseType: "arraybuffer",
            }
        );

        res.setHeader("Content-Type", "audio/wav");
        res.send(fastApiResponse.data);

        fs.unlinkSync(req.file.path);

    } catch (error) {
        console.error("Error synthesizing speech:", error.message);
        res.status(500).json({ message: "Speech synthesis failed", error: error.message });
    }
});

module.exports = router;

