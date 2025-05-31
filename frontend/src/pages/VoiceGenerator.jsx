import React, { useState, useRef } from "react";
import axios from "axios";
import "./generator.css";

const VoiceGenerator = () => {
    const [textPrompt, setTextPrompt] = useState("");
    const [sampleAudioFile, setSampleAudioFile] = useState(null);
    const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const audioRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSampleAudioFile(file);
        }
    };

    const handleGenerateVoice = async () => {
        setError(null);
        setGeneratedAudioUrl(null);

        if (!textPrompt) {
            setError("Please enter a text prompt.");
            return;
        }

        if (!sampleAudioFile) {
            setError("Please upload a sample audio file.");
            return;
        }

        const formData = new FormData();
        formData.append("text", textPrompt);
        formData.append("speaker_wav", sampleAudioFile);

        let token = null;
        try {
            const userInfo = localStorage.getItem("userInfo");
            token = userInfo ? JSON.parse(userInfo)?.token : null;
        } catch (err) {
            setError("Authentication error (token parsing). Please log in again.");
            return;
        }

        if (!token) {
            setError("Authentication error. Please log in again.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/api/users/voicegen", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`,
                },
                responseType: "blob",
            });

            const audioBlob = new Blob([response.data], { type: "audio/wav" });
            const audioUrl = URL.createObjectURL(audioBlob);
            setGeneratedAudioUrl(audioUrl);
        } catch (err) {
            setError(`Voice generation failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card-container">
            <div className="card">
                <div className="form-side">
                    <h2 className="page-title">Voice Generator</h2>

                    <div className="form-group">
                        <div className="script-label-row">
                            <label htmlFor="text-prompt" className="text-area-label">Text Prompt</label>
                            <span className="char-count">{textPrompt.length} / 500</span>
                        </div>
                        <textarea
                            id="text-prompt"
                            className="script-input"
                            maxLength={500}
                            placeholder="Enter your text prompt here..."
                            value={textPrompt}
                            onChange={(e) => setTextPrompt(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="text-area-label">Sample Audio</label>
                        <div
                            className="upload-box"
                            onClick={() => document.getElementById("file-upload").click()}
                        >
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/727/727245.png"
                                alt="Upload Icon"
                                className="icon-img"
                            />
                            <span className="upload-text">Click to upload sample audio</span>
                            <span className="upload-subtext">Supported formats: WAV, MP3, etc.</span>
                            <input
                                id="file-upload"
                                type="file"
                                accept="audio/*"
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            />
                        </div>
                        {sampleAudioFile && <p className="note-text">{sampleAudioFile.name}</p>}
                    </div>

                    <div className="button-wrapper">
                        <button
                            className="generate-button"
                            onClick={handleGenerateVoice}
                            disabled={isLoading}
                        >
                            {isLoading ? "Generating..." : "Generate Voice"}
                        </button>
                    </div>

                    {error && <p className="note-text" style={{ color: "var(--secondary)" }}>{error}</p>}
                </div>

                <div className="avatar-side" style={{ marginTop: "10rem", fontSize: "1.5rem" }}>
                    {generatedAudioUrl ? (
                        <>
                            <p className="avatar-selected-text" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Generated Voice Audio</p>
                            <div className="avatar-preview-box" style={{ boxShadow: 'none' }}
                            >
                                <audio ref={audioRef} controls src={generatedAudioUrl} />
                            </div>
                            <a
                                href={generatedAudioUrl}
                                download="generated_voice.wav"
                                className="note-text"
                                style={{ marginTop: "1rem", color: "var(--primary)" }}
                            >
                                Download Audio
                            </a>
                        </>
                    ) : (
                        <p className="avatar-selected-text" style={{ marginTop: "10rem", fontSize: "1.5rem" }}>Your generated audio will appear here</p>
                    )}
                </div>
            </div>
        </div >
    );
};

export default VoiceGenerator;
