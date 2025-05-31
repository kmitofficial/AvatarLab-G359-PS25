require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFileToCloudinary = async (filePath, folder = 'avatarlab_videos') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'video', // Specify it's a video
            folder: folder,         // Organize in a specific folder in Cloudinary
            // You can add transformations here if you want:
            // eager: [
            //     { width: 300, height: 300, crop: 'pad', audio_codec: 'none' } // Example: create a thumbnail
            // ]
        });
        console.log("File uploaded to Cloudinary successfully:", result.secure_url);
        // result.secure_url is the HTTPS URL of the uploaded video
        return result.secure_url;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);
        throw error;
    }
};

const deleteFileFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        console.log("File deleted from Cloudinary successfully:", publicId);
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        throw error;
    }
};

module.exports = {
    uploadFileToCloudinary,
    deleteFileFromCloudinary
};