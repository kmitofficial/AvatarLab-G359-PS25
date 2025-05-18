import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import LoginPage from "./pages/loginpage";         // Assuming you created this file
import SignupPage from "./pages/signuppage";
import AvatarVideoGenerator from "./pages/videogenerator1";
import AvatarUploadPage from "./pages/videogenerator2";

function App() {
    return (
        <BrowserRouter> {/* Provides routing context */}
            <Routes> {/* Defines the list of routes */}
                <Route path="/" element={<LandingPage />} /> {/* Homepage route */}
                <Route path="/login" element={<LoginPage />} /> {/* Login page route */}
                <Route path="/signup" element={<SignupPage />} /> {/* Signup page route */}
                <Route path="/generate-video/:id" element={<AvatarVideoGenerator />} />
                <Route path="/avatar-upload" element={<AvatarUploadPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
