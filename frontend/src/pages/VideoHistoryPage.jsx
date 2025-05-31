// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { Button } from "@/components/ui/button"; // Assuming this is your Button component from ShadCN/UI

// const VideoHistoryPage = () => {
//     const [videos, setVideos] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const navigate = useNavigate();
//     const BACKEND_URL = "http://localhost:5000"; // Ensure this matches your Node.js backend URL

//     useEffect(() => {
//         const fetchVideoHistory = async () => {
//             setIsLoading(true);
//             setError(null);
//             try {
//                 // Get auth token from localStorage
//                 const userInfoString = localStorage.getItem("userInfo");
//                 if (!userInfoString) {
//                     setError("User not logged in.");
//                     setIsLoading(false);
//                     navigate('/login'); // Redirect to login if not authenticated
//                     return;
//                 }
//                 const token = JSON.parse(userInfoString)?.token;
//                 if (!token) {
//                     setError("Authentication token missing.");
//                     setIsLoading(false);
//                     navigate('/login'); // Redirect to login if token is missing
//                     return;
//                 }

//                 // Make GET request to your Node.js backend history endpoint
//                 const response = await axios.get(`${BACKEND_URL}/api/fast/history`, {
//                     headers: {
//                         Authorization: `Bearer ${token}`, // Include token for protected route
//                     },
//                 });

//                 if (response.data && response.data.videos) {
//                     setVideos(response.data.videos);
//                 } else {
//                     setError("No video history data received.");
//                 }
//             } catch (err) {
//                 console.error("Error fetching video history:", err.response?.data || err.message);
//                 setError(`Failed to load history: ${err.response?.data?.message || err.message}`);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchVideoHistory();
//     }, [navigate, BACKEND_URL]); // Dependencies: re-run if navigate or backend URL changes

//     return (
//         <div className="video-history-container p-4 min-h-screen bg-gray-900 text-white">
//             <h2 className="text-3xl font-bold mb-6 text-center text-purple-400">Your Video History</h2>

//             {error && <p className="text-red-500 text-center mb-4">{error}</p>}

//             {isLoading ? (
//                 <p className="text-center text-gray-400">Loading video history...</p>
//             ) : videos.length === 0 ? (
//                 <p className="text-center text-gray-400">You haven't generated any videos yet. Go to the{' '}
//                     <Button
//                         variant="link" // Assuming 'link' variant exists for text buttons
//                         className="text-purple-400 hover:text-purple-300"
//                         onClick={() => navigate('/generate')}
//                     >
//                         Generator
//                     </Button>{' '}to create one!
//                 </p>
//             ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                     {videos.map((video) => (
//                         <div key={video._id} className="video-card bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
//                             <video controls className="w-full h-auto rounded-md mb-3 border border-gray-700">
//                                 {/* video.url will be the direct Cloudinary URL */}
//                                 <source src={video.url} type="video/mp4" />
//                                 Your browser does not support the video tag.
//                             </video>
//                             <p className="text-sm text-gray-300 mb-1 break-all text-center">{video.filename}</p>
//                             <p className="text-xs text-gray-500 text-center">Generated: {new Date(video.createdAt).toLocaleString()}</p>
//                             <a href={video.url} download={video.filename} className="text-purple-400 hover:underline text-sm mt-3 inline-block">
//                                 Download Video
//                             </a>
//                         </div>
//                     ))}
//                 </div>
//             )}
//             <Button
//                 className="bg-[#9B8FFF] text-[#0B0A1E] mt-8 block mx-auto hover:bg-[#8076e0]"
//                 onClick={() => navigate(-1)}
//             >
//                 ← Back
//             </Button>
//         </div>
//     );
// };

// export default VideoHistoryPage;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import "./history.css";

const VideoHistoryPage = () => {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const BACKEND_URL = "http://localhost:5000"; // Ensure this matches your Node.js backend URL

    useEffect(() => {
        const fetchVideoHistory = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Get auth token from localStorage
                const userInfoString = localStorage.getItem("userInfo");
                if (!userInfoString) {
                    setError("User not logged in.");
                    setIsLoading(false);
                    navigate('/login'); // Redirect to login if not authenticated
                    return;
                }
                const token = JSON.parse(userInfoString)?.token;
                if (!token) {
                    setError("Authentication token missing.");
                    setIsLoading(false);
                    navigate('/login'); // Redirect to login if token is missing
                    return;
                }

                // Make GET request to your Node.js backend history endpoint
                const response = await axios.get(`${BACKEND_URL}/api/fast/history`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include token for protected route
                    },
                });

                if (response.data && response.data.videos) {
                    setVideos(response.data.videos);
                } else {
                    setError("No video history data received.");
                }
            } catch (err) {
                console.error("Error fetching video history:", err.response?.data || err.message);
                setError(`Failed to load history: ${err.response?.data?.message || err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideoHistory();
    }, [navigate, BACKEND_URL]);

    const handleDownload = async (video) => {
        try {
            const userInfoString = localStorage.getItem("userInfo");
            const token = JSON.parse(userInfoString)?.token;

            if (!token) {
                alert("You are not authenticated. Please log in.");
                navigate('/login');
                return;
            }

            // Call your backend download proxy endpoint
            // The backend will fetch the video from Cloudinary and stream it
            const response = await axios.get(`${BACKEND_URL}/api/fast/download-video/${video._id}`, {
                responseType: 'blob', // IMPORTANT: tells axios to expect binary data
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Create a Blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', video.filename || 'generated_video.mp4'); // Use filename from your video object
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url); // Clean up the URL object

            console.log(`Download initiated for: ${video.filename}`);

        } catch (error) {
            console.error("Error initiating download:", error.response?.data || error.message);
            alert("Failed to download video. Please try again.");
        }
    };

    // --- NEW: handleDelete function ---
const handleDelete = async (video) => {
        if (!window.confirm(`Are you sure you want to delete "${video.filename}"?`)) {
            return; // User cancelled the deletion
        }

        try {
            const userInfoString = localStorage.getItem("userInfo");
            const token = JSON.parse(userInfoString)?.token;

            if (!token) {
                alert("You are not authenticated. Please log in.");
                    navigate('/login');
                return;
            }

            // Make a DELETE request to your backend endpoint
            // You'll need to create this endpoint on your Node.js backend.
            const response = await axios.delete(`${BACKEND_URL}/api/fast/history/${video._id}`, { // Use video._id
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                // Remove the deleted video from the state to update UI
                setVideos(prevVideos => prevVideos.filter(v => v._id !== video._id));
                alert("Video deleted successfully!");
                console.log(`Deleted video with ID: ${video._id}`);
            } else {
                alert(`Failed to delete video: ${response.data?.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error("Error deleting video:", err.response?.data || err.message);
            alert(`Error deleting video: ${err.response?.data?.message || err.message}`);
        }
    };

  return (
    <div className="history-wrapper">
      <div className="history-container">
        <h2 className="history-title">Video History</h2>

        {videos.length === 0 ? (
          <p className="no-videos">No videos generated yet.</p>
        ) : (
          videos.map((video, index) => (
            <div key={index} className="history-card">
              <video src={video.url} controls className="video-preview" />

              <div className="video-details">
                <p className="video-name">{video.filename}</p>
                <p className="video-date">
                  Created: {new Date(video.createdAt).toLocaleString()}
                </p>
                <div className="button-group">
                <Button onClick={() => handleDownload(video)} className="btn download-btn">
                    Download
                </Button>
                {/* --- NEW: Delete button calls handleDelete --- */}
                <Button onClick={() => handleDelete(video)} className="btn delete-btn">
                    Delete
                </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default VideoHistoryPage;
