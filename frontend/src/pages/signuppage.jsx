import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = 'Please enter a valid email address.';
        }
        if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters.';
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }
        return newErrors;
    };

    const handleSignup = async () => {
        try {
            if (password !== confirmPassword) {
                alert("Passwords do not match");
                return;
            }

            const response = await fetch("http://localhost:5000/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password
                    // no username needed
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Signup successful:", data);
                navigate("/");
            } else {
                console.error("Signup error:", data.message);
                alert("Signup failed: " + data.message);
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("Signup failed. Try again.");
        }
    };

    const handleGoogleSuccess = (credentialResponse) => {
        console.log("Google Sign-Up Success:", credentialResponse);
        // --- TODO: Send credentialResponse.credential (JWT token) to your backend ---
        // Your backend should verify the token with Google, create the user,
        // issue your own session/token, and then you can navigate.
        // ---
        console.log("Navigating to login after Google signup..."); // Placeholder
        // --- FIX: Correct navigation path ---
        navigate('/login'); // Navigate to LOGIN page after successful Google Sign-Up
        // --- END FIX ---
    };

    const handleGoogleError = () => {
        console.log('Google Sign-Up Failed');
        // Maybe show an error message to the user
    };


    return (
        <GoogleOAuthProvider clientId="800398690714-ld7j6iu64r69urrroc6dtad1r857sand.apps.googleusercontent.com">
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0B0C24] to-[#15163A] text-white p-4">
                <div className="bg-[#1D1F42] shadow-2xl rounded-2xl p-8 max-w-sm w-full text-center border border-[#2E2F55]">
                    <h2 className="text-lg font-semibold text-purple-400">AVATAR AI</h2>
                    <h3 className="text-md font-semibold text-white mt-1 mb-6">CREATE YOUR ACCOUNT</h3>

                    <GoogleLogin
                        onSuccess={(credentialResponse) => {
                            console.log('Google Sign-Up Success:', credentialResponse);
                            // Mock backend call
                            navigate('/src/login');
                        }}
                        onError={() => {
                            console.log('Google Sign-Up Failed');
                        }}
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
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}

                        <label className="text-sm font-medium text-gray-300 mt-4 block">Password*</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-1 p-2 pr-10 bg-[#2B2D55] text-white border border-[#3B3E73] rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Create password"
                            />
                            <span
                                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}

                        <label className="text-sm font-medium text-gray-300 mt-4 block">Confirm Password*</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full mt-1 p-2 pr-10 bg-[#2B2D55] text-white border border-[#3B3E73] rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Repeat password"
                            />
                            <span
                                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        onClick={handleSignup}
                        type="button"
                        className="bg-[#9B8FFF] text-[#0B0A1E] font-semibold rounded-full px-6 py-2 text-sm sm:text-base hover:bg-[#7a6fe3] transition mt-6 w-full"
                    >
                        Sign Up
                    </button>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-400">Already have an account? </span>
                        <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 hover:underline">
                            Login
                        </Link>
                    </div>

                </div>
            </div>
        </GoogleOAuthProvider>
    );
}