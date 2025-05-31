const User = require('../models/User');
const path = require('path');

const uploadAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const avatarPath = `/uploads/avatars/${req.file.filename}`;
        user.avatars.push(avatarPath);
        await user.save();
        res.status(200).json({ message: 'Avatar uploaded successfully', avatar: avatarPath });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const linkAvatar = async (req, res) => {
    try {
        const { avatarUrl } = req.body;
        const user = await User.findById(req.user._id);
        user.avatars.push(avatarUrl);
        await user.save();
        res.status(200).json({ message: 'Avatar linked successfully', avatar: avatarUrl });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { uploadAvatar, linkAvatar };
