// const express = require("express");
// const axios = require("axios");
// const User = require("../models/User");
// const protect = require("../middleware/authMiddleware");
// const fs = require("fs");
// const FormData = require("form-data");
// const path = require("path");
// const multer = require("multer");

// const router = express.Router();

// const uploadDir = path.join(__dirname, "..", "uploads"); // Create 'uploads' folder in backend root
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadDir); // Save uploaded files to 'uploads/'
//     },
//     filename: function (req, file, cb) {
//         // Create a unique filename to avoid conflicts
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });

// const BASE_AVATAR_PATH = "D:\\avatarlab\\backend\\src\\avatars"; // Example base path for avatar images
// const BASE_SAMPLE_AUDIO_PATH = "D:\\avatarlab\\backend\\src\\sampleaudio"; // Example base path for sample audio
// const BASE_REF_PATH = "D:\\avatarlab\\ref_eyeblink.mp4"; // Example base path for ref files (eye, pose) - adjust if needed

// // Helper to get avatar image path based on index
// const getAvatarImagePath = (index) => {
//   // Assumes images are named avatar_0.jpg, avatar_1.jpg etc. ADJUST FILENAME/EXTENSION AS NEEDED
//   const filename = `th${index}.jpg`;
//   return path.join(BASE_AVATAR_PATH, filename);
// };

// // Helper to get sample audio path
// const getSampleAudioPath = (sampleId) => {
//    // Assumes audio files are sample1.mp3, sample2.mp3. ADJUST FILENAME/EXTENSION AS NEEDED
//   const filename = `${sampleId}.wav`;
//   return path.join(BASE_SAMPLE_AUDIO_PATH, filename);
// };

// // POST /api/fast/sendapi
// router.post("/sendapi", protect,upload.single('audio_data'), async (req, res) => {
//   console.log("Received request body:", req.body);
//   console.log("Received file:", req.file);

//   try {
//     const { script, avatar_id, audio_type, audio_data } = req.body;
//     const userId = req.user._id;

//     // --- Validation ---
//     if (!script) return res.status(400).json({ message: "Script is required" });
//     if (avatar_id === undefined || avatar_id === null) return res.status(400).json({ message: "Avatar ID is required" });
//     if (!audio_type) return res.status(400).json({ message: "Audio type is required" });
//     if (audio_type === 'sample' && !audio_data) return res.status(400).json({ message: "Audio data (sample ID) is required for sample type" });
//     if (audio_type === 'upload' && !req.file) return res.status(400).json({ message: "Audio data (file) is required for upload type" });

//     // --- Determine File Paths for FastAPI ---
//     const avatarIndex = parseInt(avatar_id, 10);
//     const dynamicImagePath = getAvatarImagePath(avatarIndex);

//     let dynamicAudioPath = null;
//     if (audio_type === 'sample') {
//         dynamicAudioPath = getSampleAudioPath(audio_data); // audio_data is "sample1" or "sample2"
//     } else if (audio_type === 'upload' && req.file) {
//         dynamicAudioPath = req.file.path; // Use the path where multer saved the file
//     }

//     // --- Check if files exist ---
//      if (!fs.existsSync(dynamicImagePath)) {
//          console.error(`Avatar image not found at: ${dynamicImagePath}`);
//          return res.status(400).json({ message: `Selected avatar image not found on server (ID: ${avatarIndex}).` });
//      }
//      if (!dynamicAudioPath || !fs.existsSync(dynamicAudioPath)) {
//          console.error(`Audio file not found at: ${dynamicAudioPath}`);
//          return res.status(400).json({ message: `Selected audio source not found on server.` });
//      }
//      // Check reference files (adjust paths/logic if needed)
//      const refEyeBlinkPath = BASE_REF_PATH
//      const refPosePath = BASE_REF_PATH
//      if (!fs.existsSync(refEyeBlinkPath) || !fs.existsSync(refPosePath)) {
//          console.error(`Reference files not found in ${BASE_REF_PATH}`);
//          // Decide if this is a fatal error or if defaults can be used
//          return res.status(500).json({ message: `Required reference files not found.` });
//      }
//     // --- End File Check ---

//     // Prepare FormData to send to FastAPI
//     const form = new FormData();
//     form.append("text", script);
//     form.append("language", "en");
//     form.append("language", "en"); // Keep hardcoded or make dynamic if needed
//     form.append("speaker_wav", fs.createReadStream(dynamicAudioPath)); // Use dynamic path
//     form.append("image", fs.createReadStream(dynamicImagePath)); // Use dynamic path
//     form.append("ref_eyeblink", fs.createReadStream(refEyeBlinkPath)); // Keep hardcoded or make dynamic
//     form.append("ref_pose", fs.createReadStream(refPosePath)); // Keep hardcoded or make dynamic

//     console.log("Sending data to FastAPI:", { script, avatar_id, audio_type, dynamicAudioPath, dynamicImagePath });

//     // Call FastAPI
//     const response = await axios.post("https://75fa-34-124-223-239.ngrok-free.app/process/", form, {
//       headers: {
//         ...form.getHeaders(),
//         "Authorization": `Bearer ${req.user.token}`,
//       }
//     });

//     const generatedVideoPath = response.data.video_path;

//     // Ensure 'videos' folder exists
//     if (!generatedVideoPath || !fs.existsSync(generatedVideoPath)) {
//       console.error(`FastAPI did not return a valid video path or file not found: ${generatedVideoPath}`);
//       // Clean up uploaded file if it exists
//       if (audio_type === 'upload' && req.file) fs.unlinkSync(req.file.path);
//       return res.status(500).json({ message: "Video generation failed (FastAPI result invalid)." });
//     }

//     // Ensure 'videos' folder exists relative to THIS file's location
//     const videosDir = path.join(__dirname, "..", "public", "videos"); // Save in public/videos to serve easily
//     if (!fs.existsSync(videosDir)) {
//         fs.mkdirSync(videosDir, { recursive: true });
//     }

//     const videoFilename = `output_${userId}_${Date.now()}.mp4`; // Include userId for uniqueness
//     const savePath = path.join(videosDir, videoFilename);
//     const publicVideoUrl = `/videos/${videoFilename}`; // URL path

//     fs.renameSync(generatedVideoPath, savePath); // Move the video from FastAPI's output location
//     console.log(`Video moved to: ${savePath}`);

//     // Clean up uploaded audio file if it was an upload
//     if (audio_type === 'upload' && req.file) {
//         fs.unlink(req.file.path, (err) => { // Delete asynchronously
//               if (err) console.error("Error deleting uploaded audio file:", err);
//               else console.log("Uploaded audio file deleted:", req.file.path);
//         });
//     }

//     // Save video reference to user model in MongoDB
//     const updatedUser = await User.findByIdAndUpdate(userId, {
//         $push: {
//             videos: {
//                 filename: videoFilename,
//                 filepath: savePath, // Store server path if needed for internal use
//                 url: publicVideoUrl, // Store URL path for frontend access
//                 createdAt: new Date()
//             }
//         }
//     }, { new: true }); // Return updated document if needed

//     if (!updatedUser) {
//           // Handle case where user might not be found, though 'protect' should prevent this
//           console.error("User not found for saving video path:", userId);
//           // Video is saved, but DB update failed. Decide how to handle.
//     }

//     // Send response back to frontend
//     res.status(200).json({
//         message: "Video generated successfully!",
//         videoFilename: videoFilename,
//         videoUrl: publicVideoUrl, // Send the public URL
//     });

//     } catch (err) {
//     console.error("Error in /sendapi route:", err);

//     // Clean up uploaded file if an error occurred AFTER upload but before success
//     if (req.file && fs.existsSync(req.file.path)) {
//         fs.unlink(req.file.path, (unlinkErr) => {
//               if (unlinkErr) console.error("Error deleting uploaded audio file during error handling:", unlinkErr);
//         });
//     }

//     // Check if the error is from axios (FastAPI call)
//     if (err.response) {
//         console.error('FastAPI Error Data:', err.response.data);
//         console.error('FastAPI Error Status:', err.response.status);
//         return res.status(500).json({ message: `Video generation failed: ${err.response.data?.detail || 'FastAPI Error'}` });
//     } else if (err.request) {
//         // The request was made but no response was received
//         console.error('FastAPI No Response:', err.request);
//           return res.status(500).json({ message: "Video generation failed: No response from processing service." });
//     } else {
//         // Something happened in setting up the request that triggered an Error
//         console.error('Error Setting Up Request:', err.message);
//         return res.status(500).json({ message: `Server error: ${err.message}` });
//     }
//     }
// });

// router.get("/test-video", (req, res) => {
//     const testVideoFilename = "test_video.mp4"; // The name of the file you placed in public/videos
//     const publicVideoUrl = `/videos/${testVideoFilename}`; // The URL path

//     // Optional: Server-side check if the file actually exists, for robustnes
//     // This path needs to be relative to where fastroutes.js is, to find the public folder.
//     // Assuming 'public' is at the project root, and 'fastroutes.js' is in a 'routes' subfolder:
//     const serverFilePath = path.join(__dirname, "..", "public", "videos", testVideoFilename);

//     if (fs.existsSync(serverFilePath)) {
//         console.log(`[Test Endpoint] Serving URL for existing file: ${publicVideoUrl}`);
//         res.status(200).json({
//             message: "Test video URL provided successfully.",
//             videoUrl: publicVideoUrl,
//             // You could also provide a test audio URL if you have one in public/audios
//             // audioUrl: "/audios/test_audio.wav"
//         });
//     } else {
//         console.error(`[Test Endpoint] Test video file not found at: ${serverFilePath}`);
//         res.status(404).json({
//             message: `Test video file '${testVideoFilename}' not found on server. Please ensure it's in the 'public/videos' directory.`,
//             videoUrl: null,
//         });
//     }
// });


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
        const response = await axios.post("https://localhost:5000/process/", form, { // Make sure this ngrok URL is up-to-date
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

        // Save video reference to user model in MongoDB
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $push: {
                videos: {
                    filename: `generated_video_${userId}_${Date.now()}.mp4`, // Friendly name for display
                    url: publicCloudinaryUrl,           // Store the public Cloudinary URL
                    cloudinaryPublicId: cloudinaryAssetPublicId, // Store Public ID for potential future deletion
                    createdAt: new Date()
                }
            }
        }, { new: true });

        if (!updatedUser) {
            console.error("User not found for saving video path:", userId);
            // Decide how to handle this: still respond successfully, but log a warning.
        }

        // Send response back to frontend
        res.status(200).json({
            message: "Video generated successfully!",
            videoFilename: `generated_video_${userId}_${Date.now()}.mp4`, // Friendly name
            videoUrl: publicCloudinaryUrl, // Send the public Cloudinary URL to frontend
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
                // Decide how to handle this:
                // 1. Continue deleting from DB even if Cloudinary fails (less strict)
                // 2. Return an error and don't delete from DB (more strict, but might leave orphaned DB entry)
                // For now, we'll log and continue to delete from DB.
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

// REMOVED: /test-video route is no longer relevant for S3/Cloudinary storage
// If you need a test endpoint, it should return a hardcoded Cloudinary URL or similar.
// router.get("/test-video", (req, res) => {
//     // IMPORTANT: Replace 'test_video.mp4' with the actual filename of a video
//     // you have placed in D:\avatarlab\backend\src\public\videos\
//     const testVideoFilename = "output_6817447ef325ecab1fb52175_1746588998217.mp4"; // <--- CHANGE THIS FILENAME
//     const serverFilePath = path.join(__dirname, "..", "public", "videos", testVideoFilename);

//     if (fs.existsSync(serverFilePath)) {
//         console.log(`[Test Endpoint] Serving local file: ${serverFilePath}`);
//         // Serve the file directly. Express will automatically handle Content-Type for known file types.
//         res.sendFile(serverFilePath);
//     } else {
//         console.error(`[Test Endpoint] Test video file not found at: ${serverFilePath}`);
//         res.status(404).json({
//             message: `Test video file '${testVideoFilename}' not found on server. Please ensure it's in the 'public/videos' directory.`,
//         });
//     }
// });

module.exports = router;