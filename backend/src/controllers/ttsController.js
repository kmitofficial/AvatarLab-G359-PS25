const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const TTS_API_URL = "http://127.0.0.1:8001/synthesize/";

exports.generateVoice = async (req, res) => {
    try {
        const { text } = req.body;
        const speakerWav = req.file;

        if (!text || !speakerWav) {
            return res.status(400).json({ message: "Text and speaker_wav are required." });
        }

        const form = new FormData();
        form.append("text", text);
        form.append("language", "en");
        form.append("speaker_wav", fs.createReadStream(speakerWav.path));


        const response = await axios.post(TTS_API_URL, form, {
            headers: form.getHeaders(),
            responseType: "arraybuffer"
        });

        res.set("Content-Type", "audio/wav");
        res.send(response.data);
    } catch (error) {
        console.error("TTS Error:", error.message);
        res.status(500).json({ message: "Voice generation failed" });
    }
};
