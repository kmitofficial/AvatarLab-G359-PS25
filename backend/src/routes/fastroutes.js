
// module.exports = router;
const express = require("express");
const axios = require("axios");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const { uploadFileToCloudinary, deleteFileFromCloudinary } = require('../utils/cloudinary'); // NEW: Import Cloudinary functions
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");
const multer = require("multer");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads"); // Multer's temporary upload folder
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const BASE_AVATAR_PATH = "D:\\avatarlab\\backend\\src\\avatars";
const BASE_SAMPLE_AUDIO_PATH = "D:\\avatarlab\\backend\\src\\sampleaudio";
const BASE_REF_PATH = "D:\\avatarlab\\ref_eyeblink.mp4"; // Ensure this path is correct on your local system

const getAvatarImagePath = (index) => {
    const filename = `th${index}.jpg`;
    return path.join(BASE_AVATAR_PATH, filename);
};

const getSampleAudioPath = (sampleId) => {
    const filename = `${sampleId}.wav`;
    return path.join(BASE_SAMPLE_AUDIO_PATH, filename);
};

// POST /api/fast/sendapi - Generate video and upload to Cloudinary
router.post("/sendapi", protect, upload.single('audio_data'), async (req, res) => {
    console.log("Received request body:", req.body);
    console.log("Received file:", req.file);

    let uploadedAudioFilePath = null;      // Path for audio file uploaded by user (for cleanup)
    let tempGeneratedVideoPath = null;     // Temporary local path for video received from FastAPI
    let cloudinaryPublicId = null;         // Cloudinary's public_id for the uploaded video

    try {
        const { script, avatar_id, audio_type, audio_data } = req.body;
        const userId = req.user._id;

        // --- Validation ---
        if (!script) return res.status(400).json({ message: "Script is required" });
        if (avatar_id === undefined || avatar_id === null) return res.status(400).json({ message: "Avatar ID is required" });
        if (!audio_type) return res.status(400).json({ message: "Audio type is required" });
        if (audio_type === 'sample' && !audio_data) return res.status(400).json({ message: "Audio data (sample ID) is required for sample type" });
        if (audio_type === 'upload' && !req.file) return res.status(400).json({ message: "Audio data (file) is required for upload type" });

        // --- Determine File Paths for FastAPI ---
        const avatarIndex = parseInt(avatar_id, 10);
        const dynamicImagePath = getAvatarImagePath(avatarIndex);

        let dynamicAudioPath = null;
        if (audio_type === 'sample') {
            dynamicAudioPath = getSampleAudioPath(audio_data);
        } else if (audio_type === 'upload' && req.file) {
            dynamicAudioPath = req.file.path;
            uploadedAudioFilePath = req.file.path; // Store for later cleanup
        }

        // --- Check if local files exist before sending to FastAPI ---
        if (!fs.existsSync(dynamicImagePath)) {
            console.error(`Avatar image not found at: ${dynamicImagePath}`);
            return res.status(400).json({ message: `Selected avatar image not found on server (ID: ${avatarIndex}).` });
        }
        if (!dynamicAudioPath || !fs.existsSync(dynamicAudioPath)) {
            console.error(`Audio file not found at: ${dynamicAudioPath}`);
            return res.status(400).json({ message: `Selected audio source not found on server.` });
        }
        const refEyeBlinkPath = BASE_REF_PATH;
        const refPosePath = BASE_REF_PATH; // Assuming ref_pose is also the same file for simplicity
        if (!fs.existsSync(refEyeBlinkPath) || !fs.existsSync(refPosePath)) {
            console.error(`Reference files not found in ${BASE_REF_PATH}`);
            return res.status(500).json({ message: `Required reference files not found.` });
        }

        // Prepare FormData to send to FastAPI
        const form = new FormData();
        form.append("text", script);
        form.append("language", "en"); // This is a form field, not a file. It should only be appended once.
        form.append("speaker_wav", fs.createReadStream(dynamicAudioPath), { filename: path.basename(dynamicAudioPath), contentType: 'audio/wav' }); // Provide filename and content type
        form.append("image", fs.createReadStream(dynamicImagePath), { filename: path.basename(dynamicImagePath), contentType: 'image/jpeg' });
        form.append("ref_eyeblink", fs.createReadStream(refEyeBlinkPath), { filename: path.basename(refEyeBlinkPath), contentType: 'video/mp4' });
        form.append("ref_pose", fs.createReadStream(refPosePath), { filename: path.basename(refPosePath), contentType: 'video/mp4' }); // Provide filename and content type

        console.log("Sending data to FastAPI:", { script, avatar_id, audio_type, dynamicAudioPath, dynamicImagePath });

        // Call FastAPI and expect a binary arraybuffer response (the video file)
        const response = await axios.post("http://127.0.0.1:8003/process/", form, { // Make sure this ngrok URL is up-to-date
            headers: {
                ...form.getHeaders(),
                // 'Authorization': `Bearer ${req.user.token}`, // FastAPI does not use this Authorization
            },
            responseType: 'arraybuffer',
            timeout: 600000,
        });

        // --- TEMPORARY LOCAL SAVE & CLOUDINARY UPLOAD ---
        // Create a temporary local path for the video from FastAPI
        const tempVideosDir = path.join(__dirname, "..", "temp_videos"); // Create a dedicated temp folder
        if (!fs.existsSync(tempVideosDir)) {
            fs.mkdirSync(tempVideosDir, { recursive: true });
        }
        const tempVideoFilename = `temp_output_${userId}_${Date.now()}.mp4`;
        tempGeneratedVideoPath = path.join(tempVideosDir, tempVideoFilename);

        // Write the received binary data to a temporary local file
        fs.writeFileSync(tempGeneratedVideoPath, Buffer.from(response.data));
        console.log(`Video temporarily saved to: ${tempGeneratedVideoPath}`);

        // Generate a unique public_id for Cloudinary (e.g., user_videos/USERID_TIMESTAMP)
        const cloudinaryPublicIdPrefix = 'avatarlab_videos'; // Matches the folder in utils/cloudinary.js
        const cloudinaryAssetPublicId = `${cloudinaryPublicIdPrefix}/${userId}_${Date.now()}`;
        cloudinaryPublicId = cloudinaryAssetPublicId; // Store for cleanup in catch

        // Upload the temporary local video file to Cloudinary
        const publicCloudinaryUrl = await uploadFileToCloudinary(
            tempGeneratedVideoPath,
            cloudinaryAssetPublicId, // This will be the public_id in Cloudinary
            'video' // Resource type
        );
        console.log(`Video uploaded to Cloudinary: ${publicCloudinaryUrl}`);
        // --- END TEMPORARY LOCAL SAVE & CLOUDINARY UPLOAD ---

        // Clean up temporary local video file after Cloudinary upload
        if (tempGeneratedVideoPath && fs.existsSync(tempGeneratedVideoPath)) {
            fs.unlink(tempGeneratedVideoPath, (err) => {
                if (err) console.error("Error deleting temporary generated video file:", err);
                else console.log("Temporary generated video file deleted:", tempGeneratedVideoPath);
            });
        }

        // Clean up uploaded audio file if it was an upload
        if (uploadedAudioFilePath && fs.existsSync(uploadedAudioFilePath)) {
            fs.unlink(uploadedAudioFilePath, (err) => {
                if (err) console.error("Error deleting uploaded audio file:", err);
                else console.log("Uploaded audio file deleted:", uploadedAudioFilePath);
            });
        }

        const newVideoData = { // Create the object first
            filename: `generated_video_${userId}_${Date.now()}.mp4`, // Friendly name for display
            url: publicCloudinaryUrl,             // Store the public Cloudinary URL
            cloudinaryPublicId: cloudinaryAssetPublicId, // Store Public ID for potential future deletion
            createdAt: new Date()
        };



        const updatedUser = await User.findByIdAndUpdate(userId, {
            $push: {
                videos: newVideoData // Push the newVideoData object
            }
        }, { new: true });

        if (!updatedUser) {
            console.error("User not found for saving video path:", userId);
            // Decide how to handle this: still respond successfully, but log a warning.
        }

        const savedVideoSubdocument = updatedUser.videos.find(video => video.url === publicCloudinaryUrl);

        let videoIdToSend = null;
        if (savedVideoSubdocument) {
            videoIdToSend = savedVideoSubdocument._id;
        } else {
            // Fallback: If for some reason find fails, try the last one or log an error
            console.warn("Could not find the newly added video subdocument by URL. Attempting to use last added.");
            if (updatedUser.videos.length > 0) {
                videoIdToSend = updatedUser.videos[updatedUser.videos.length - 1]._id;
            }
        }


        // Send response back to frontend
        res.status(200).json({
            message: "Video generated successfully!",
            videoFilename: `generated_video_${userId}_${Date.now()}.mp4`, // Friendly name
            videoUrl: publicCloudinaryUrl,
            videoId: videoIdToSend
        });

    } catch (err) {
        console.error("Error in /sendapi route:", err);

        // Clean up: delete temp local video and uploaded audio if they exist
        if (tempGeneratedVideoPath && fs.existsSync(tempGeneratedVideoPath)) {
            fs.unlink(tempGeneratedVideoPath, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting temporary generated video file during error handling:", unlinkErr);
            });
        }
        if (uploadedAudioFilePath && fs.existsSync(uploadedAudioFilePath)) {
            fs.unlink(uploadedAudioFilePath, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting uploaded audio file during error handling:", unlinkErr);
            });
        }
        // NEW: If upload to Cloudinary failed, attempt to delete from Cloudinary if it was partially uploaded
        if (cloudinaryPublicId) {
            deleteFileFromCloudinary(cloudinaryPublicId, 'video').catch(cloudinaryErr => console.error("Error deleting partially uploaded Cloudinary asset:", cloudinaryErr));
        }


        if (err.response) {
            let errorMessage = 'FastAPI Error';
            if (err.response.data) {
                try {
                    // Axios returns arraybuffer for responseType: 'arraybuffer' on errors too.
                    // Convert Buffer to string and parse JSON.
                    const errorData = JSON.parse(Buffer.from(err.response.data).toString());
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch (parseError) {
                    errorMessage = `FastAPI Error: ${err.response.statusText || 'Unknown response'}`;
                    console.error('FastAPI Raw Error Response (non-JSON):', Buffer.from(err.response.data).toString());
                }
            }
            console.error('FastAPI Error Status:', err.response.status);
            return res.status(500).json({ message: `Video generation failed: ${errorMessage}` });
        } else if (err.request) {
            console.error('FastAPI No Response:', err.request);
            return res.status(500).json({ message: "Video generation failed: No response from processing service." });
        } else {
            console.error('Error Setting Up Request:', err.message);
            return res.status(500).json({ message: `Server error: ${err.message}` });
        }
    }
});

// NEW: GET /api/fast/history - Fetch user's video history from DB
router.get("/history", protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // Find the user by ID and select only the 'videos' array
        // .lean() for plain JS objects, faster for read-only operations
        const user = await User.findById(userId).select('videos').lean();

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Sort by createdAt in descending order (most recent first)
        const sortedVideos = user.videos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        res.status(200).json({
            message: "User video history fetched successfully.",
            videos: sortedVideos,
        });

    } catch (error) {
        console.error("Error fetching video history:", error);
        res.status(500).json({ message: "Server error fetching video history." });
    }
});

router.get('/download-video/:id', protect, async (req, res) => {
    try {
        const videoId = req.params.id; // The _id of the video subdocument
        const userId = req.user._id;   // The _id of the authenticated user

        // 1. Find the user document
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // 2. Find the specific video subdocument within the user's videos array
        const video = user.videos.find(
            video => video._id.toString() === videoId // Convert _id to string for comparison
        );

        if (!video) {
            return res.status(404).json({ message: "Video not found or you don't have permission to download it." });
        }

        // 3. Get the Cloudinary URL from the video subdocument
        const cloudinaryUrl = video.url;

        // 4. Fetch the video from Cloudinary
        const response = await axios({
            method: 'GET',
            url: cloudinaryUrl,
            responseType: 'stream' // IMPORTANT: Stream the response
        });

        // 5. Set appropriate headers for download
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${video.filename || 'downloaded_video.mp4'}"`);
        // Pass content length if available, crucial for download progress
        if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
        }

        // 6. Pipe the Cloudinary stream directly to the client response
        response.data.pipe(res);

        // Handle potential errors during streaming from Cloudinary
        response.data.on('error', (err) => {
            console.error('Error during video streaming from Cloudinary:', err);
            if (!res.headersSent) {
                res.status(500).json({ message: "Failed to stream video for download." });
            }
        });

        // Log when the response stream finishes
        res.on('finish', () => {
            console.log(`Successfully streamed ${video.filename} for download.`);
        });

    } catch (error) {
        console.error("Error in download-video endpoint:", error);
        if (error.response) {
            // Handle errors from Cloudinary fetch (e.g., Cloudinary file not found, 404 from Cloudinary)
            res.status(error.response.status).json({ message: `Cloudinary error: ${error.response.statusText}` });
        } else {
            // Handle other errors (e.g., database errors, network issues)
            res.status(500).json({ message: "Failed to prepare video for download." });
        }
    }
});
router.delete('/history/:id', protect, async (req, res) => {
    try {
        const videoId = req.params.id; // The ID of the video subdocument
        const userId = req.user._id;   // The ID of the currently authenticated user

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Find the index of the video to be deleted
        const videoIndex = user.videos.findIndex(
            video => video._id.toString() === videoId
        );

        if (videoIndex === -1) {
            return res.status(404).json({ message: "Video not found or not associated with this user." });
        }

        const videoToDelete = user.videos[videoIndex];

        // --- IMPORTANT: Delete the actual video file from Cloudinary ---
        if (videoToDelete.cloudinaryPublicId) {
            try {
                await deleteFileFromCloudinary(videoToDelete.cloudinaryPublicId);
                console.log(`Cloudinary asset deleted: ${videoToDelete.cloudinaryPublicId}`);
            } catch (cloudinaryErr) {
                console.error(`Failed to delete Cloudinary asset ${videoToDelete.cloudinaryPublicId}:`, cloudinaryErr);
            }
        }

        // Remove the video from the array
        user.videos.splice(videoIndex, 1);

        // Save the updated user document
        await user.save();

        res.status(200).json({ message: "Video deleted successfully!", videoId });
    } catch (error) {
        console.error("Error deleting video:", error);
        res.status(500).json({ message: "Failed to delete video." });
    }
});


module.exports = router;