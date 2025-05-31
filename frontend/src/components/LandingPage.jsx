import React, { useState ,useRef ,useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './home.css'; // Optional custom CSS if needed
import avatar1 from "../images/th1.jpg";
import avatar2 from "../images/th2.jpg";
import avatar3 from "../images/th3.jpg";
import avatar4 from "../images/th4.jpg";
import avatar5 from "../images/avatar5.webp";

import background from "../images/background.jpg";

import { Link } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import ProfileDropdown from '../pages/profiledropdown';

const avatarDemos = [
    {
        id: 1,
        image: avatar4, // Assuming this is from src/images or a static URL
        video: "/videos/avatar4_demo.mp4" // <--- Correct path relative to 'public' folder
    },
    {
        id: 2,
        image: avatar2,
        video: "/videos/avatar2_demo.mp4"
    },
    {
        id: 3,
        image: avatar3,
        video: "/videos/avatar3_demo.mp4"
    },
    {
        id: 4,
        image: avatar5,
        video: "/videos/avatar1_demo.mp4"
    }
];

const LandingPage = () => {
    const [loading, setLoading] = useState(false);
    const [videoPath, setVideoPath] = useState(""); // State to store video path for playing
    const [playingAvatar, setPlayingAvatar] = useState(null); // State to track which avatar's video is playing
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    
    const currentVideoRef = useRef(null);

    // --- NEW: Effect to control video playback when videoPath changes ---
    useEffect(() => {
        if (currentVideoRef.current && videoPath) {
            // Play the video when videoPath is set
            currentVideoRef.current.play().catch(error => {
                // Catching play() promise rejection (e.g., if user hasn't interacted yet)
                console.error("Video play failed:", error);
            });
        } else if (currentVideoRef.current && !videoPath) {
            // Pause and reset if videoPath is cleared
            currentVideoRef.current.pause();
            currentVideoRef.current.currentTime = 0;
        }
    }, [videoPath]);


    console.log('LandingPage received auth state:', { isAuthenticated, isLoading });

    const handleGetStartedClick = () => {
    console.log('[Get Started CLICK] State at click:', { isAuthenticated, isLoading });
    
    if (!isAuthenticated) {
        console.log('[Get Started CLICK] User not authenticated. Redirecting to login.');
        alert("Please log in to get started!");
        navigate('/login');
    } else {
        console.log('[Get Started CLICK] User authenticated. Redirecting to generate video.');
        navigate('/generate-video/1'); // Navigate to generator page with default avatar ID 1
    }
    };

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

    const handleAvatarSelect = (avatarId, videoUrl) => {
        if (playingAvatar === avatarId) {
            // If the same avatar is clicked, pause the current video and reset states
            if (currentVideoRef.current) {
                currentVideoRef.current.pause();
                currentVideoRef.current.currentTime = 0; // Rewind to start
            }
            setPlayingAvatar(null);
            setVideoPath(""); // Clear the video path to hide the video
        } else {
            // If a different avatar is clicked, or none is playing, set it to play
            setPlayingAvatar(avatarId);
            setVideoPath(videoUrl);
        }
    };


    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${background})` }}
        >
            <div className=" min-h-screen flex flex-col items-center px-4 sm:px-6 lg:px-12 font-['Inter']">
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
                        <nav className="hidden md:flex space-x-8 text-sm text-white/80 font-medium">
                            {['Home', 'About', 'History', 'Try Voice Generator'].map((link) => {
                                const pathMap = {
                                    'Home': '/',
                                    'About': '/about',
                                    'History': '/history',
                                    'Try Voice Generator': '/voice-generator'
                                };
                                return (
                                    <a key={link} href={pathMap[link]} className="hover:text-white transition">
                                        {link}
                                    </a>
                                );
                            })}
                        </nav>
                        <div className="hidden md:inline-block">
                        {isLoading ? (
                            <span className="text-sm text-gray-400">Loading...</span> // Or a spinner
                        ) : isAuthenticated ? (
                             <ProfileDropdown /> // Show ProfileDropdown when logged in
                        ) : (
                            <Link to="/login">
                                <button type="button" className="rounded-full border border-white/60 text-white/80 text-sm font-semibold px-5 py-2 hover:text-white hover:border-white transition">
                                    Login/SignUp
                                </button>
                            </Link>
                        )}
                        </div>
                    </header>

                    {/* Main */}
                    <main className="text-center max-w-4xl mx-auto mb-14 px-2 sm:px-0">
                        <h1 className="text-white font-extrabold text-3xl sm:text-4xl md:text-5xl leading-tight mb-4">
                            Revolutionize Storytelling
                            <br />
                            with <span className="text-[#9B8FFF]">AI Video Magic</span>
                        </h1>
                        <p className="text-white/70 text-xs sm:text-sm max-w-[520px] mx-auto mb-8 leading-tight">
                            Transform your concepts into stunning, professional-quality videos effortlessly.
                            <br />
                            Let our AI bring your imagination to life with precision and creativity
                        </p>
                        <button
                            type="button"
                            className="bg-[#9B8FFF] text-[#0B0A1E] font-semibold rounded-full px-6 py-2 text-sm sm:text-base hover:bg-[#7a6fe3] transition"
                            onClick={handleGetStartedClick}
                        >
                            Generate Now
                        </button>
                    </main>

                    {/* How It Works Section */}
                    <h6 className="text-white font-extrabold text-3xl sm:text-4xl md:text-5xl leading-tight mb-4">
                        How it Works?
                    </h6>
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
                    {/* Features Section */}
                    <section className="mt-20 max-w-6xl mx-auto px-4">
                        <div className="max-w-7xl mx-auto px-6 py-10">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0">
                                <h1 className="text-3xl md:text-4xl font-semibold max-w-xl leading-tight">
                                    {/* <span className="text-[#9B8FFF]">Features</span><br /> */}
                                    <span className="text-white font-extrabold text-3xl sm:text-4xl md:text-5xl leading-tight mb-4">
                                        Why Choose Us?
                                    </span>
                                </h1>
                                <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-xl"> Our platform is designed to make creating videos easy and fun. With our user-friendly interface, you can create stunning videos in just a few clicks. We offer a wide range of avatars to choose from, and you can even upload your own audio files to personalize your videos. Plus, our AI technology ensures that your videos are of the highest quality.</p>
                            </div>
                            {/* <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
                                {[feature1, feature2, feature3, feature4].map((img, idx) => (
                                    <img src={img} alt={`Feature ${idx + 1}`} className="rounded-2xl" width="320" height="200" />
                                ))}
                            </div> */}
                        </div>
                    </section>

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
                                {avatarDemos.map((avatar) => ( // Loop through avatarDemos
                                    <div key={avatar.id} className="relative rounded-3xl overflow-hidden">
                                        {/* If video is playing for this avatar, show the video */}
                                        {playingAvatar === avatar.id && videoPath && (
                                            <video controls className="w-full h-full object-cover rounded-3xl" autoPlay loop>
                                                <source src={videoPath} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        )}

                                        {/* If video is NOT playing, show the image */}
                                        {playingAvatar !== avatar.id && (
                                            <img src={avatar.image} alt={`Avatar ${avatar.id}`} className="w-full h-full object-cover rounded-3xl" />
                                        )}

                                        <button
                                            aria-label={`Play avatar ${avatar.id} video`}
                                            onClick={() => handleAvatarSelect(avatar.id, avatar.video)} // Pass imported video variable
                                            className="absolute bottom-4 left-4 w-12 h-12 bg-white border border-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
                                        >
                                            {playingAvatar === avatar.id ? (
                                                <i className="fas fa-pause text-[#9B8FFF] text-lg"></i>
                                            ) : (
                                                <i className="fas fa-play text-[#9B8FFF] text-lg"></i>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Voice Generator Link Section */}
                    {/* <section className="mt-20 max-w-6xl mx-auto px-4 text-center">
                        <button
                            type="button"
                            className="bg-[#9B8FFF] text-[#0B0A1E] font-semibold rounded-full px-6 py-2 text-sm sm:text-base hover:bg-[#7a6fe3] transition"
                            onClick={() => window.location.href = "/voice-generator"}
                        >
                            Try Voice Generator
                        </button>
                    </section> */}
                </div>
            </div>
        </div >
    );
};


export default LandingPage;
