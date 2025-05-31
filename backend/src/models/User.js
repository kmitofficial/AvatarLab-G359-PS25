const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const videoSchema = new mongoose.Schema({
    filename: { type: String, required: true }, // A friendly name for the video
    url: { type: String, required: true },      // The public URL from Cloudinary
    cloudinaryPublicId: { type: String, required: true }, // Cloudinary's unique ID for deletion
    createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: false,
            default: function () {
                return this.email.split("@")[0]; // auto-assign from email
            },
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/.+@.+\..+/, "Please enter a valid email address"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
        },
        videos: [videoSchema] 
    },
    { timestamps: true }
);

// Hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.matchPassword = function (entered) {
    return bcrypt.compare(entered, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
