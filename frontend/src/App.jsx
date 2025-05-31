import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import LoginPage from "./pages/loginpage";         // Assuming you created this file
import SignupPage from "./pages/signuppage";
import AvatarVideoGenerator from "./pages/videogenerator1";
import AvatarUploadPage from "./pages/videogenerator2";
import VideoHistoryPage from './pages/VideoHistoryPage';
import VoiceGenerator from "./pages/VoiceGenerator";
import About from "./pages/About";

function App() {
    return (
            <Routes> {/* Defines the list of routes */}
                <Route path="/" element={<LandingPage />} /> {/* Homepage route */}
                <Route path="/login" element={<LoginPage />} /> {/* Login page route */}
                <Route path="/signup" element={<SignupPage />} /> {/* Signup page route */}
                <Route path="/generate-video/:id" element={<AvatarVideoGenerator />} />
                <Route path="/avatar-upload" element={<AvatarUploadPage />} />
                <Route path="/history" element={<VideoHistoryPage />} /> 
                <Route path="/voice-generator" element={<VoiceGenerator />} />
                <Route path="/about" element={<About />} />
            </Routes>
        
    );
}

export default App;
