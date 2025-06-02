
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import uploadIcon from "../images/cloud-arrow-up-solid.svg";
import avatar1 from "../images/th1.jpg"; // ✅ Make sure this image exists
import "./generator.css";
import axios from 'axios';
import background from "../images/background.jpg";

const AudioUploadPage = () => {
    const location = useLocation();
    console.log("State passed from previous page:", location.state);
    const navigate = useNavigate();
    const BACKEND_URL = "http://localhost:5000";

    const initialAvatarIndex = location.state?.avatarIndex;
    const initialScript = location.state?.script;
    const initialAvatarSrc = location.state?.avatarSrc;

    // State from previous page
    const [script, setScript] = useState("");
    const [avatarIndex, setAvatarIndex] = useState(initialAvatarIndex !== undefined ? initialAvatarIndex : null);
    const [avatarSrc, setAvatarSrc] = useState(initialAvatarSrc || null); // For display

    // Local state for this page
    const [selectedAudioFile, setSelectedAudioFile] = useState(null);
    const [selectedAudioOption, setSelectedAudioOption] = useState(""); // sample1, sample2
    const [audioPreviewSrc, setAudioPreviewSrc] = useState(null); // For preview player
    const [isLoading, setIsLoading] = useState(false); // Loading state for API call
    const [error, setError] = useState(null); // Error state
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);
    const [generatedVideoId, setGeneratedVideoId] = useState(null);

    // Refs for audio and video players
    const audioRef = useRef(null);
    const videoRef = useRef(null); // NEW: Ref for the video player

    // Get state passed from previous page
    useEffect(() => {
        if (location.state) {
            setScript(location.state.script || "");
            setAvatarIndex(location.state.avatarIndex !== undefined ? location.state.avatarIndex : null);
            setAvatarSrc(location.state.avatarSrc || null);
        } else {
            console.warn("No state received from previous page.");
        }
    }, [location.state]);

    // Update preview source when selection changes (without autoplay)
    useEffect(() => {
        setError(null);
        setGeneratedVideoUrl(null); // Clear video when audio selection changes
        if (selectedAudioOption === "sample1") {
            setAudioPreviewSrc("/audio/clip_00000.wav");
            setSelectedAudioFile(null);
        } else if (selectedAudioOption === "sample2") {
            setAudioPreviewSrc("/audio/clip_00009.wav");
            setSelectedAudioFile(null);
        } else if (selectedAudioFile) {
            setAudioPreviewSrc(URL.createObjectURL(selectedAudioFile));
            setSelectedAudioOption("");
        } else {
            setAudioPreviewSrc(null);
        }

        // PAUSE and RESET audio player when source changes to prevent unwanted autoplay
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [selectedAudioOption, selectedAudioFile]);

    useEffect(() => {
        if (generatedVideoUrl && videoRef.current) {
            console.log("Attempting programmatic play for video:", generatedVideoUrl);
            videoRef.current.load(); // Ensure the video element is loaded
            videoRef.current.play().catch(error => {
                console.log("Programmatic video autoplay prevented:", error);
                // This error means the browser blocked it.
                // User needs to manually click play.
            });
        }
    }, [generatedVideoUrl]);
    // Autoplay preview (REMOVED - handled by user controls now)
    // useEffect(() => {
    //     if (audioRef.current && audioPreviewSrc) {
    //         audioRef.current.load();
    //         audioRef.current.play().catch((e) => {
    //             console.log("Audio preview autoplay prevented by browser.");
    //         });
    //     }
    // }, [audioPreviewSrc]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedAudioFile(file);
            setSelectedAudioOption("");
        }
    };

    const handleDownload = async () => { // No 'video' parameter needed now
        if (!generatedVideoId) {
            alert("No video has been generated yet, or its ID is missing. Please generate a video first.");
            return;
        }

        try {
            const userInfoString = localStorage.getItem("userInfo");
            const token = JSON.parse(userInfoString)?.token;

            if (!token) {
                alert("You are not authenticated. Please log in.");
                navigate('/login');
                return;
            }

            // Call your backend download proxy endpoint using generatedVideoId
            const response = await axios.get(`${BACKEND_URL}/api/fast/download-video/${generatedVideoId}`, {
                responseType: 'blob', // IMPORTANT: tells axios to expect binary data
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Create a Blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            // You might want a better filename, perhaps from a header in the backend response
            // For now, let's use a generic name or try to infer from the URL
            const defaultFilename = `generated_video_${generatedVideoId}.mp4`;
            const contentDisposition = response.headers['content-disposition'];
            let filename = defaultFilename;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url); // Clean up the URL object

            console.log(`Download initiated for video ID: ${generatedVideoId}`);

        } catch (error) {
            console.error("Error initiating download:", error.response?.data || error.message);
            alert("Failed to download video. Please try again. Check console for details.");
        }
    };


    const handleGenerateVideo = async () => {
        setError(null);
        setGeneratedVideoUrl(null);
        setIsLoading(true);
        console.log("--- [handleGenerateVideo] Function START ---");

        console.log("[handleGenerateVideo] Checking validation...");
        console.log("[handleGenerateVideo] Values:", { avatarIndex, script, selectedAudioFile, selectedAudioOption });

        // Validation
        if (avatarIndex === null) {
            setError("Avatar selection is missing. Please go back.");
            setIsLoading(false); // Make sure to reset loading on validation error
            return;
        }
        if (!script) {
            setError("Script is missing. Please go back.");
            setIsLoading(false);
            return;
        }
        if (!selectedAudioFile && !selectedAudioOption) {
            setError("Please select a sample audio or upload an audio file.");
            setIsLoading(false);
            return;
        }
        console.log("[handleGenerateVideo] Validation PASSED.");

        // --- Prepare FormData ---
        const formData = new FormData();
        formData.append("script", script);
        formData.append("avatar_id", avatarIndex);

        if (selectedAudioFile) {
            formData.append("audio_type", "upload");
            formData.append("audio_data", selectedAudioFile);
        } else {
            formData.append("audio_type", "sample");
            formData.append("audio_data", selectedAudioOption);
        }
        console.log("[handleGenerateVideo] FormData prepared.");

        // --- Get Auth Token ---
        let token = null;
        const userInfoString = localStorage.getItem("userInfo");
        if (userInfoString) {
            try {
                token = JSON.parse(userInfoString)?.token;
                console.log("[handleGenerateVideo] Token check result:", token ? 'FOUND' : 'MISSING in userInfo');
            } catch (e) {
                console.error("Error parsing userInfo", e);
                setError("Authentication error (parsing). Please log in again.");
                setIsLoading(false);
                return;
            }
        }
        else {
            console.log("[handleGenerateVideo] userInfo NOT found in localStorage.");
        }

        if (!token) {
            setError("Authentication error. Please log in again.");
            setIsLoading(false);
            return;
        }

        // --- API Call ---
        console.log("[handleGenerateVideo] Setting isLoading=true...");
        setIsLoading(true);
        console.log("[handleGenerateVideo] ---> Attempting axios.post to /api/fast/sendapi <---");

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
                setGeneratedVideoUrl(response.data.videoUrl);
                alert(`Video generated successfully! It should appear in the avatar preview area.`);
            } else {
                console.error("Backend response missing videoUrl:", response.data);
                setError("Video generated, but no URL received from backend.");
            }

        } catch (err) {
            console.error("Video generation error:", err.response?.data || err.message);
            setError(`Video generation failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsLoading(false);
        }
        console.log("--- [handleGenerateVideo] Function END ---");
    };


    return (
        <div className="card-container"
            style={{ backgroundImage: `url(${background})`, backgroundRepeat: "no-repeat", backgroundSize: "cover" }}
        >
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

                    {/* Audio Preview Player (always visible, but source changes) */}
                    {audioPreviewSrc && (
                        <div className="audio-preview-area mt-4">
                            <h4 className="text-white mb-2">Audio Preview:</h4>
                            <audio ref={audioRef} controls src={audioPreviewSrc} type="audio/mp3">
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    )}
                </div>

                <div className="avatar-side">
                    <h3 className="avatar-selected-text">Avatar selected</h3>
                    <div className="avatar-preview-box">
                        {generatedVideoUrl && !isLoading ? ( // If video URL exists and not loading, show video
                            <div className="generated-video-wrapper">
                                <video
                                    ref={videoRef}
                                    // width="400"
                                    controls
                                    key={generatedVideoUrl}
                                    className="generated-video"
                                    // Add autoplay and muted for potential immediate playback
                                    autoPlay
                                    muted
                                >
                                    <source src={generatedVideoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ) : ( // Otherwise, show avatar or "No avatar selected" message
                            avatarSrc ? (
                                <div className="avatar-image-wrapper">
                                    <img src={avatarSrc} alt={`Avatar ${avatarIndex !== null ? avatarIndex + 1 : ''}`} className="avatar-image" style={{ width: "400px", height: "auto" }} />
                                </div>
                            ) : (
                                <p>No Avatar selected.</p>
                            )
                        )}
                    </div> {/* End of avatar-preview-box */}

                    {/* {generatedVideoUrl && !isLoading && (
                    // <a href={generatedVideoUrl} download={`generated_video_${avatarIndex}.mp4`} className="text-purple-400 hover:underline mt-4 block text-center download-link-below-box">
                    //     Download Video
                    // </a>
                    // <Button onClick={handleDownload} className="text-purple-400 hover:underline mt-4 block text-center download-link-below-box">
                    //         Download Video
                    // </Button>
                )} */}

                    <div className="button-wrapper">
                        <Button
                            className="generate-button"
                            onClick={handleGenerateVideo}
                            disabled={isLoading}
                        >
                            {isLoading ? "Generating..." : "Generate Video"}
                        </Button>

                        {/* <Button
                            className="generate-button" // Or a different style
                            onClick={handleFetchTestVideo}
                            disabled={isLoading}
                            style={{backgroundColor: '#28a745', marginLeft: '1rem'}} // Example: green button
                        >
                            {isLoading ? "Loading Test Video..." : "Load Test Video"}
                    </Button> */}
                    </div>

                </div> {/* End of avatar-side */}

                {/* Back Button */}
                {/* <Button
                    className="bg-[#9B8FFF] text-[#0B0A1E] back-bottom-left-button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </Button> */}
            </div>
        </div>
    );
};

export default AudioUploadPage;