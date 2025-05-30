require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require('path');

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const ttsRoutes = require("./routes/ttsRoutes");
const fastRoutes = require("./routes/fastroutes");
const protect = require("./middleware/authMiddleware");


connectDB();

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use(cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true
  }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tts", ttsRoutes); // <-- ✅ Mount TTS route
app.use("/api/fast", fastRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.get('/auth/check', protect, (req, res) => {
  res.json({
      loggedIn: true,
      user: req.user,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


