import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './home.css'; // Optional custom CSS if needed
import avatar1 from "../images/th1.jpg";
import avatar2 from "../images/th2.jpg";
import avatar3 from "../images/th3.jpg";
import avatar4 from "../images/th4.jpg";
import { Link } from 'react-router-dom';

const LandingPage = () => {
    const [loading, setLoading] = useState(false);
    const [videoPath, setVideoPath] = useState(""); // State to store video path for playing
    const [playingAvatar, setPlayingAvatar] = useState(null); // State to track which avatar's video is playing
    const navigate = useNavigate();

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("Generating AI video...");
        await new Promise((res) => setTimeout(res, 2000));
        setLoading(false);
        alert("Video generated!");
    };

    const handleGenerateClick = () => {
        navigate("/generate");
    };

    const handleAvatarSelect = (idx, video) => {
        setPlayingAvatar(idx); // Set the index of the avatar whose video is playing
        setVideoPath(video); // Set the video path based on selected avatar
    };

    return (
        <div className="bg-[#0f0e2c] min-h-screen flex flex-col items-center px-4 sm:px-6 lg:px-12 font-['Inter']">
            <div className="max-w-[1200px] w-full relative pt-10 pb-16">
                <img
                    src="https://storage.googleapis.com/a1aa/image/8dff483c-c072-447f-3d6e-d435daea833d.jpg"
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none -z-10"
                />

                {/* Header */}
                <header className="flex justify-between items-center mb-12 px-2 sm:px-0">
                    <div className="flex items-center space-x-2">
                        <img
                            src="https://storage.googleapis.com/a1aa/image/508527bc-ce6e-4909-65bf-f29c60fc5d3a.jpg"
                            alt="Logo"
                            className="w-8 h-8"
                        />
                        <span className="text-[#9B8FFF] font-semibold text-lg select-none">AVARTAR AI</span>
                    </div>
                    {/* <nav className="hidden md:flex space-x-8 text-sm text-white/80 font-medium">
                        {['Home', 'About', 'Features', 'Pricing', 'Video AI'].map((link) => (
                            <a key={link} href="#" className="hover:text-white transition">
                                {link}
                            </a>
                        ))}
                    </nav> */}
                    <Link to="/login">
                        <button
                            type="button"
                            className="hidden md:inline-block rounded-full border border-white/60 text-white/80 text-sm font-semibold px-5 py-2 hover:text-white hover:border-white transition"
                        >
                            Login/SignUp
                        </button>
                    </Link>
                </header>

                {/* Main */}
                <main className="text-center max-w-4xl mx-auto mb-14 px-2 sm:px-0">
                    <h1 className="text-white font-extrabold text-3xl sm:text-4xl md:text-5xl leading-tight mb-4">
                        Bring Your Ideas to Life
                        <br />
                        with <span className="text-[#9B8FFF]">AI Video Magic</span>
                    </h1>
                    <p className="text-white/70 text-xs sm:text-sm max-w-[520px] mx-auto mb-8 leading-tight">
                        Transform your concepts into stunning, professional-quality videos effortlessly.
                        <br />
                        Let our AI bring your imagination to life with precision and creativity
                    </p>
                    <Link to="/generate-video/1"> {/* Navigate to generator page with default avatar ID 1 */}
                        <button
                            type="button"
                            className="bg-[#9B8FFF] text-[#0B0A1E] font-semibold rounded-full px-6 py-2 text-sm sm:text-base hover:bg-[#7a6fe3] transition"
                        >
                            Get Started Now
                        </button>
                    </Link>
                </main>

                {/* How It Works Section */}
                <div className="max-w-7xl w-full flex flex-col md:flex-row gap-8 md:gap-6 lg:gap-10">
                    {[
                        {
                            title: "Choose your avatar",
                            desc: "Choose the avatar that best suits your brand and your audience",
                            img: "https://storage.googleapis.com/a1aa/image/210e5eab-615a-4757-3696-a7634dc2358b.jpg"
                        },
                        {
                            title: "Personalize your video",
                            desc: "Give your own voice for the Avatar that you like and Personalize your Video",
                            img: "https://storage.googleapis.com/a1aa/image/a33f3f9f-d39f-4376-2929-64a532f8de0d.jpg"
                        },
                        {
                            title: "Generate and export your video.",
                            desc: "Generate your video and download it to use it as you wish",
                            img: "https://storage.googleapis.com/a1aa/image/015d0638-5219-4f1d-abc0-e7a3a9a5c990.jpg"
                        }
                    ].map((step, index) => (
                        <div key={index} className="bg-[#0B0A1E] rounded-2xl p-6 md:p-8 flex flex-col items-center max-w-xs md:max-w-[320px] text-center">
                            <img src={step.img} alt={step.title} className="rounded-2xl mb-6" width="320" height="200" />
                            <h2 className="text-white text-xl md:text-2xl font-semibold mb-2">{step.title}</h2>
                            <p className="text-gray-300 text-sm md:text-base leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Avatar Demo Section */}
                <section className="mt-20 max-w-6xl mx-auto px-4">
                    <div className="max-w-7xl mx-auto px-6 py-10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0">
                            <h1 className="text-3xl md:text-4xl font-semibold max-w-xl leading-tight">
                                <span className="text-[#9B8FFF]">Generate avatars with just a prompt.</span>
                                <br />
                                <span className="text-white font-extrabold text-3xl sm:text-4xl md:text-5xl leading-tight mb-4">
                                    Describe it and let AI do the rest.
                                </span>
                            </h1>
                        </div>

                        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
                            {[avatar1, avatar2, avatar3, avatar4].map((img, idx) => (
                                <div key={idx} className="relative rounded-3xl overflow-hidden">
                                    {/* If video is playing for this avatar, show the video */}
                                    {playingAvatar === idx && videoPath && (
                                        <video controls className="w-full h-full object-cover rounded-3xl">
                                            <source src={videoPath} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    )}

                                    {/* If video is NOT playing, show the image */}
                                    {playingAvatar !== idx && (
                                        <img src={img} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover rounded-3xl" />
                                    )}

                                    <button
                                        aria-label={`Play avatar ${idx + 1} video`}
                                        onClick={() => handleAvatarSelect(idx, `path/to/video${idx + 1}.mp4`)} // Replace with actual video path later
                                        className="absolute bottom-4 left-4 w-12 h-12 bg-white border border-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
                                    >
                                        <i className="fas fa-play text-[#9B8FFF] text-lg"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LandingPage;
