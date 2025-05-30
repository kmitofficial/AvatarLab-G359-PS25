import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import uploadIcon from "../images/cloud-arrow-up-solid.svg";
import avatar1 from "../images/th1.jpg"; // ✅ Make sure this image exists
import "./generator.css";
import axios from 'axios';

const AudioUploadPage = () => {
    const location = useLocation();
    console.log("State passed from previous page:", location.state);
    const navigate = useNavigate();
    const BACKEND_URL = "http://localhost:5000";

    const initialAvatarIndex = location.state?.avatarIndex; // Use optional chaining
    const initialScript = location.state?.script;
    const initialAvatarSrc = location.state?.avatarSrc;

    // State from previous page
    const [script, setScript] = useState("");
    const [avatarIndex, setAvatarIndex] = useState(initialAvatarIndex !== undefined ? initialAvatarIndex : null);
    const [avatarSrc, setAvatarSrc] = useState(initialAvatarSrc || null);// For display

    // Local state for this page
    const [selectedAudioFile, setSelectedAudioFile] = useState(null);
    const [selectedAudioOption, setSelectedAudioOption] = useState(""); // sample1, sample2
    const [audioPreviewSrc, setAudioPreviewSrc] = useState(null); // For preview player
    const [isLoading, setIsLoading] = useState(false); // Loading state for API call
    const [error, setError] = useState(null); // Error state
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);


    const audioRef = useRef(null);

    // Get state passed from previous page
    useEffect(() => {
        if (location.state) {
            setScript(location.state.script || "");
            setAvatarIndex(location.state.avatarIndex !== undefined ? location.state.avatarIndex : null);
            setAvatarSrc(location.state.avatarSrc || null); // Use passed src for display
        } else {
            // Handle case where user lands here directly (optional)
            console.warn("No state received from previous page.");
            // navigate('/'); // Maybe redirect home
        }
    }, [location.state]);

    // Update preview source when selection changes
    useEffect(() => {
        setError(null); // Clear error on selection change
        setGeneratedVideoUrl(null);
        if (selectedAudioOption === "sample1") {
            setAudioPreviewSrc("/audio/clip_00000.wav"); // Assuming these are in public/audio
            setSelectedAudioFile(null); // Clear file if sample selected
        } else if (selectedAudioOption === "sample2") {
            setAudioPreviewSrc("/audio/clip_00009.wav");
            setSelectedAudioFile(null);
        } else if (selectedAudioFile) {
            setAudioPreviewSrc(URL.createObjectURL(selectedAudioFile));
            setSelectedAudioOption(""); // Clear sample if file selected
        } else {
            setAudioPreviewSrc(null);
        }
    }, [selectedAudioOption, selectedAudioFile]);

    // Autoplay preview (optional, often blocked by browsers)
    useEffect(() => {
        if (audioRef.current && audioPreviewSrc) {
            audioRef.current.load();
            audioRef.current.play().catch((e) => {
                console.log("Audio preview autoplay prevented by browser.");
            });
        }
    }, [audioPreviewSrc]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedAudioFile(file);
            setSelectedAudioOption(""); // Clear dropdown if a file is uploaded
        }
    };

    const handleGenerateVideo = async () => {
        setError(null); // Clear previous errors
        setGeneratedVideoUrl(null); // Clear previous video result
        setIsLoading(true);
        console.log("--- [handleGenerateVideo] Function START ---");

        console.log("[handleGenerateVideo] Checking validation..."); // 2. VALIDATION START
        console.log("[handleGenerateVideo] Values:", { avatarIndex, script, selectedAudioFile, selectedAudioOption });

        // Validation
        if (avatarIndex === null) {
            setError("Avatar selection is missing. Please go back.");
            return;
        }
        if (!script) {
            setError("Script is missing. Please go back.");
            return;
        }
        if (!selectedAudioFile && !selectedAudioOption) {
            setError("Please select a sample audio or upload an audio file.");
            return;
        }
        console.log("[handleGenerateVideo] Validation PASSED.");

        // --- Prepare FormData ---
        const formData = new FormData();
        formData.append("script", script);
        formData.append("avatar_id", avatarIndex); // Send the index

        if (selectedAudioFile) {
            formData.append("audio_type", "upload");
            formData.append("audio_data", selectedAudioFile); // Append the file object
        } else {
            formData.append("audio_type", "sample");
            formData.append("audio_data", selectedAudioOption); // Send sample identifier ("sample1" or "sample2")
        }
        console.log("[handleGenerateVideo] FormData prepared.");

        // --- Get Auth Token ---
        // Assumes token is stored in localStorage under 'userInfo' key after login
        let token = null;
        const userInfoString = localStorage.getItem("userInfo");
        if (userInfoString) {
            try {
                token = JSON.parse(userInfoString)?.token;
                console.log("[handleGenerateVideo] Token check result:", token ? 'FOUND' : 'MISSING in userInfo');
            } catch (e) {
                console.error("Error parsing userInfo", e);
                setError("Authentication error (parsing). Please log in again.");
                return;
            }
        }
        else {
            console.log("[handleGenerateVideo] userInfo NOT found in localStorage.");
        }

        if (!token) {
            setError("Authentication error. Please log in again.");
            // Optionally redirect to login: navigate('/login');
            return;
        }

        // --- API Call ---
        console.log("[handleGenerateVideo] Setting isLoading=true..."); // 8. API CALL START
        setIsLoading(true);
        console.log("[handleGenerateVideo] ---> Attempting axios.post to /api/fast/sendapi <---"); // Log right before call

        // try {
        //     const response = await axios.post("http://localhost:5000/api/fast/sendapi", formData, {
        //         headers: {
        //             'Content-Type': 'multipart/form-data', // Important for file uploads
        //             'Authorization': `Bearer ${token}`
        //         }
        //     });
        //     console.log("[handleGenerateVideo] ---> axios.post SUCCEEDED <---"); // 9. API SUCCESS
        //     console.log("Video generation response:", response.data);
        //     if (response.data && response.data.videoUrl) {
        //         setGeneratedVideoUrl(`${BACKEND_URL}${response.data.videoUrl}`);
        //         alert(`Video generated successfully! It should appear below.`); // Changed alert
        //     } else {
        //         console.error("Backend response missing videoUrl:", response.data);
        //         setError("Video generated, but no URL received from backend.");
        //     }
        //     // TODO: Navigate to a results page or display the video/link
        //     // navigate(`/results/${response.data.videoFilename}`);

        // } catch (err) {
        //     console.error("Video generation error:", err.response?.data || err.message);
        //     setError(`Video generation failed: ${err.response?.data?.message || err.message}`);
        // } finally {
        //     setIsLoading(false);
        // }
        // console.log("--- [handleGenerateVideo] Function END ---");
        try {
            const response = await axios.post("http://localhost:5000/api/fast/sendapi", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("[handleGenerateVideo] ---> axios.post SUCCEEDED <---");
            console.log("Video generation response:", response.data);

            if (response.data && response.data.videoUrl) {
                setGeneratedVideoUrl(`${BACKEND_URL}${response.data.videoUrl}`);
                alert(`Video generated successfully! It should appear below.`);
            } else {
                console.error("Backend response missing videoUrl:", response.data);
                setError("Video generated, but no URL received from backend.");
            }
        } catch (err) {
            if (err.response) {
                // Detailed error message from the backend
                console.error("Video generation error (backend response):", err.response.data);
                setError(`Backend error: ${err.response.data.message || err.response.data.error || err.message}`);
            } else {
                // Network or other error
                console.error("Video generation error (network or unknown):", err.message);
                setError(`Video generation failed: ${err.message}`);
            }
        }

    };

    // const handleFetchTestVideo = async () => {
    //     setError(null);
    //     setGeneratedVideoUrl(null); // Clear previous video
    //     // REMOVED: setGeneratedAudioUrl(null); 
    //     setIsLoading(true);
    //     console.log("--- [handleFetchTestVideo] Requesting test video URL ---");

    //     try {
    //         // Assuming your Node.js backend is running on http://localhost:5000
    //         const response = await axios.get("http://localhost:5000/api/fast/test-video");

    //         console.log("Test video endpoint response:", response.data);

    //         if (response.data && response.data.videoUrl) {
    //             setGeneratedVideoUrl(`${BACKEND_URL}${response.data.videoUrl}`);
    //             // REMOVED: audioUrl handling
    //             // alert("Test video URL loaded! Check the player."); // You can keep or remove alert
    //         } else {
    //             setError(response.data.message || "Test video URL not received from backend.");
    //         }
    //     } catch (err) {
    //         console.error("Error fetching test video:", err.response?.data || err.message);
    //         setError(`Failed to fetch test video: ${err.response?.data?.message || err.message}`);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    return (
        <div className="card-container">
            <div className="card">
                {/* Left Side: Audio Upload */}
                <div className="form-side">
                    <h2 className="page-title">Generate a video using the avatar by giving audio.</h2>

                    <div className="form-group">
                        <label className="audio-label">Select an audio</label>
                        <select
                            className="audio-select"
                            value={selectedAudioOption}
                            onChange={(e) => setSelectedAudioOption(e.target.value)}
                        >
                            <option value="">Choose an option</option>
                            <option value="sample1">Sample 1</option>
                            <option value="sample2">Sample 2</option>
                        </select>
                    </div>

                    <div className="or-text">OR</div>
                    <p className="note-text">Note: Make sure the audio is clean</p>

                    <label htmlFor="file-upload" className="upload-box">
                        <img src={uploadIcon} alt="Upload" className="icon-img" />
                        <p className="upload-text">Upload audio from files</p>
                        <p className="upload-subtext">drag & drop a file</p>
                        <input
                            id="file-upload"
                            type="file"
                            accept="audio/*"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                    </label>

                    {/* Hidden audio player */}
                    {audioPreviewSrc && (
                        <audio ref={audioRef} controls style={{ display: "none" }}>
                            <source src={audioPreviewSrc} type="audio/mp3" />
                            Your browser does not support the audio element.
                        </audio>
                    )}
                </div>

                {/* Right Side: Avatar Preview */}
                <div className="avatar-side">
                    <h3 className="avatar-selected-text">Avatar selected</h3>
                    <div className="avatar-preview-box">
                        {avatarSrc ? (
                            <div className="avatar-image-wrapper">
                                <img src={avatarSrc} alt={`Avatar ${avatarIndex !== null ? avatarIndex + 1 : ''}`} className="avatar-image" style={{ width: "400px", height: "auto" }} />
                            </div>
                        ) : (
                            <p>No Avatar selected.</p>
                        )}
                    </div>

                    <div className="button-wrapper">
                        <Button
                            className="generate-button"
                            onClick={handleGenerateVideo} // Attach the handler
                            disabled={isLoading} // Disable button when loading
                        >
                            {isLoading ? "Generating..." : "Generate Video"}
                        </Button>

                        {/* <Button
                        className="generate-button" // Or a different style
                        onClick={handleFetchTestVideo}
                        disabled={isLoading}
                        style={{backgroundColor: '#28a745'}} // Example: green button
                    >
                        {isLoading ? "Loading Test Video..." : "Load Test Video"}
                        </Button> */}
                    </div>

                    {generatedVideoUrl && !isLoading && (
                        <div className="video-display-area mt-4">
                            <h4 className="text-white mb-2">Generated Video:</h4>
                            <video width="400" controls key={generatedVideoUrl}> {/* Use key to force re-render if URL changes */}
                                <source src={generatedVideoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            {/* Optional: Add download link */}
                            <a href={generatedVideoUrl} download={`generated_video_${avatarIndex}.mp4`} className="text-purple-400 hover:underline mt-2 block">
                                Download Video
                            </a>
                        </div>
                    )}

                </div>

                {/* Back Button */}
                <Button
                    className="bg-[#9B8FFF] text-[#0B0A1E] back-bottom-left-button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </Button>
            </div>
        </div>
    );
};

export default AudioUploadPage;
