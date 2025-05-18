import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import avatar1 from "../images/th1.jpg";
import avatar2 from "../images/th2.jpg";
import avatar3 from "../images/th3.jpg";
import avatar4 from "../images/th4.jpg";

import "./generator.css";

const AvatarVideoGenerator = () => {
    const navigate = useNavigate();

    const avatars = [avatar1, avatar2, avatar3, avatar4];
    const [scriptText, setScriptText] = useState("");
    const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);

    const handleNextAvatar = () => {
        setCurrentAvatarIndex((prevIndex) =>
            prevIndex === avatars.length - 1 ? 0 : prevIndex + 1
        );
    };

    const selectedAvatar = avatars[currentAvatarIndex];

    const goToNextStep = () => {
        if (!scriptText.trim()) {
            alert("Please enter some script text.");
            return;
        }
        // Navigate passing index and script
        navigate("/avatar-upload", {
            state: {
                avatarIndex: currentAvatarIndex+1, // Pass index (0-based)
                script: scriptText,
                avatarSrc: selectedAvatar // Keep src for display on next page
            }
        });
    };


    return (
        <div className="card-container">
            <div className="card">
                {/* Left side: Form */}
                <div className="form-side">
                    <h2 className="page-title">
                        Generate a video using the avatar by giving some Text.
                    </h2>

                    <div className="script-label-row">
                        <label className="text-area-label">Script</label>
                        <span className="char-count">{scriptText.length}/10000</span>
                    </div>

                    <textarea
                        className="script-input"
                        placeholder="Add Text"
                        value={scriptText}
                        maxLength={10000}
                        onChange={(e) => setScriptText(e.target.value)}
                    />

                    <Button
                        className="next-fixed-button"
                        onClick={goToNextStep} // Pass the function itself
                    >
                        Next →
                    </Button>
                </div>

                {/* Right side: Avatar + RIGHT button beside it */}
                <div className="avatar-side">
                    <h3 className="avatar-selected-text">Avatar selected</h3>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img
                            src={selectedAvatar}
                            alt="Selected Avatar"
                            className="avatar-image"
                            style={{ width: "300px", height: "auto" }} // Adjust size here

                        />

                        <Button
                            variant="ghost"
                            onClick={handleNextAvatar}
                            style={{ marginLeft: "1rem" }}
                        >
                            <ChevronRight size={32} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvatarVideoGenerator;
