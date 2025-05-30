import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/authcontext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleContinue = async () => {
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address.');
            return; // Stop the process if email is invalid
        } else {
            setEmailError('');
        }

        try {
            const response = await axios.post("http://localhost:5000/api/users/login", {
                email,
                password
            });

            const { token, username, _id } = response.data;
            localStorage.setItem("userInfo", JSON.stringify(response.data)); // Save token/user info
            login(response.data);
            console.log("Login successful:", username);
            navigate("/"); // Navigate after successful login
        } catch (error) {
            console.error("Login error:", error.response?.data?.message || error.message);
            alert("Login failed: " + (error.response?.data?.message || "Check credentials."));
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const { credential } = credentialResponse;
        try {
            // Send the Google OAuth token to your backend to validate and create a session
            const response = await axios.post("http://localhost:5000/api/users/google-login", {
                token: credential,
            });

            const { token, username, _id } = response.data;
            localStorage.setItem("userInfo", JSON.stringify(response.data)); // Save token/user info
            login(response.data);
            console.log("Google Login successful:", username);
            navigate("/"); // Navigate after successful Google login
        } catch (error) {
            console.error("Google Login Error:", error.response?.data?.message || error.message);
            alert("Google login failed. Please try again.");
        }
    };

    const handleGoogleError = () => {
        console.log('Google Login Failed');
        // Maybe show an error message to the user
    };

    return (
        <GoogleOAuthProvider clientId="800398690714-r66ddkf3174k0f4fb53l8rv2k32bh91m.apps.googleusercontent.com">
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0B0C24] to-[#15163A] text-white p-4">
                <div className="bg-[#1D1F42] shadow-2xl rounded-2xl p-8 max-w-sm w-full text-center border border-[#2E2F55]">
                    <h2 className="text-lg font-semibold text-purple-400">AVATAR AI</h2>
                    <h3 className="text-md font-semibold text-white mt-1 mb-6">LOG-IN TO AVATAR AI</h3>

                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="filled_black"
                    />

                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-gray-600" />
                        <span className="mx-2 text-sm text-gray-400">Or</span>
                        <hr className="flex-grow border-gray-600" />
                    </div>

                    <div className="text-left">
                        <label className="text-sm font-medium text-gray-300">Email Address*</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 p-2 bg-[#2B2D55] text-white border border-[#3B3E73] rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="you@example.com"
                        />
                        {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}

                        <label className="text-sm font-medium text-gray-300 mt-4 block">Password*</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-1 p-2 pr-10 bg-[#2B2D55] text-white border border-[#3B3E73] rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter password"
                            />
                            <span
                                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleContinue}
                        type="button"
                        className="bg-[#9B8FFF] text-[#0B0A1E] font-semibold rounded-full px-6 py-2 text-sm sm:text-base hover:bg-[#7a6fe3] transition mt-6 w-full"
                    >
                        Continue
                    </button>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-400">Don't have an account? </span>
                        <Link to="/signup" className="font-semibold text-purple-400 hover:text-purple-300 hover:underline">
                            Sign Up
                        </Link>
                    </div>

                </div>
            </div>
        </GoogleOAuthProvider>
    );
}