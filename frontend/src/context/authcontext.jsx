// // src/context/AuthContext.jsx
// import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
// // Make sure useNavigate is imported
// import { useNavigate } from 'react-router-dom';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [user, setUser] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);

//     const navigate = useNavigate();
    
//     useEffect(() => {
//         console.log("[AuthProvider EFFECT] State Change Detected - isAuthenticated:", isAuthenticated, "isLoading:", isLoading);
//     }, [isAuthenticated, isLoading]);

//     const checkAuthStatus = useCallback(async () => {
//         // ... (checkAuthStatus logic remains the same) ...
//         setIsLoading(true);
//         console.log("[Auth Check] Starting check...");
//         const userInfoString = localStorage.getItem("userInfo");
//         console.log("[Auth Check] Value from localStorage.getItem('userInfo'):", userInfoString);
//         if (!userInfoString) { /* ... set logged out ... */ 
//             console.log("[Auth Check] No 'userInfo' found. About to call setIsAuthenticated(false) / setIsLoading(false).");
//             setIsAuthenticated(false);
//             setUser(null);
//             setIsLoading(false);
//             console.log("[Auth Check] AFTER setting logged out state.");
//             return;
//         }
//         let token = null;
//         let currentUserInfo = null;
//         try {
//             currentUserInfo = JSON.parse(userInfoString);
//             token = currentUserInfo?.token;
//             console.log("[Auth Check] Parsed userInfo:", currentUserInfo);
//             console.log("[Auth Check] Extracted token:", token ? 'Found' : 'Not Found');
//             if (!token) { throw new Error('Token missing in stored userInfo'); }
//             // Optional backend check would go here
//             setIsAuthenticated(true);
//             setUser({ _id: currentUserInfo._id, username: currentUserInfo.username, email: currentUserInfo.email });
//             console.log("[Auth Check] SUCCESS - Found userInfo with token, setting authenticated state TRUE.");
//         } catch (error) {
//             console.error("[Auth Check] ERROR parsing userInfo or validating:", error);
//             localStorage.removeItem("userInfo");
//             setIsAuthenticated(false);
//             setUser(null);
//         } finally {
//             setIsLoading(false);
//             console.log("[Auth Check] Finished check, isLoading set to false.");
//         }
//     }, []); // Removed navigate dependency

//     useEffect(() => {
//         console.log("[AuthContext] useEffect running, calling checkAuthStatus");
//         checkAuthStatus();
//     }, [checkAuthStatus]);

//     const login = (userInfoData) => {
//         // ... (login logic remains the same) ...
//         if (userInfoData && userInfoData.token) {
//             localStorage.setItem("userInfo", JSON.stringify(userInfoData));
//             setIsAuthenticated(true);
//             setUser({ _id: userInfoData._id, username: userInfoData.username, email: userInfoData.email });
//             console.log("AuthContext: User logged in, state updated.");
//         } else {
//              console.error("AuthContext: login function called without valid userInfoData containing token.");
//         }
//     };

//     const logout = async () => {
//         const userInfoString = localStorage.getItem("userInfo");
//         let token = null;
//         if (userInfoString) { try { token = JSON.parse(userInfoString)?.token; } catch { /* ignore */ } }

//         try {
//             if (token) {
//                 await fetch("http://localhost:5000/auth/logout", { /* ... fetch options ... */ });
//                 console.log("AuthContext: Backend logout called.");
//             }
//         } catch (error) {
//             console.error("AuthContext: Backend logout failed:", error);
//         } finally {
//             localStorage.removeItem("userInfo");
//             setIsAuthenticated(false);
//             setUser(null);
//             console.log("AuthContext: User logged out, state cleared.");
//             // --- FIX: Use the navigate function obtained from the top level ---
//             navigate('/'); // Redirect to login after logout
//             // --- END FIX ---
//         }
//     };

//     console.log("AuthProvider providing value:", { isAuthenticated, user, isLoading });

//     return (
//         <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading, checkAuthStatus }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (context === undefined) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// };


// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // <--- NEW: Import axios

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    // This useEffect is good for observing state changes, keep it for debugging
    useEffect(() => {
        console.log("[AuthProvider EFFECT] State Change Detected - isAuthenticated:", isAuthenticated, "isLoading:", isLoading);
    }, [isAuthenticated, isLoading]);

    const checkAuthStatus = useCallback(async () => {
        setIsLoading(true);
        console.log("[Auth Check] Starting check...");
        const userInfoString = localStorage.getItem("userInfo");
        console.log("[Auth Check] Value from localStorage.getItem('userInfo'):", userInfoString);

        if (!userInfoString) {
            console.log("[Auth Check] No 'userInfo' found. Setting logged out state.");
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);
            return;
        }

        let currentUserInfo = null;
        let token = null;

        try {
            currentUserInfo = JSON.parse(userInfoString);
            token = currentUserInfo?.token;
            console.log("[Auth Check] Parsed userInfo:", currentUserInfo);
            console.log("[Auth Check] Extracted token:", token ? 'Found' : 'Not Found');

            if (!token) {
                throw new Error('Token missing in stored userInfo');
            }

            // --- IMPORTANT NEW LOGIC: Validate token with backend ---
            // This API call will hit a protected route on your backend.
            // Your backend's 'protect' middleware will verify the token's expiration.
            console.log("[Auth Check] Attempting to validate token with backend...");
            const verifyResponse = await axios.get("http://localhost:5000/api/users/profile", { // Use a protected route
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // If the above request succeeds, it means the token is valid and not expired
            setIsAuthenticated(true);
            // Update user state with fresh data from the backend if needed
            setUser({ _id: verifyResponse.data._id, username: verifyResponse.data.username, email: verifyResponse.data.email });
            console.log("[Auth Check] SUCCESS - Token validated with backend, setting authenticated state TRUE.");

        } catch (error) {
            console.error("[Auth Check] ERROR during token validation or parsing:", error);
            // If the backend returns a 401 (Unauthorized), it means the token is invalid or expired
            if (error.response && error.response.status === 401) {
                console.log("[Auth Check] Token invalid or expired (401 response). Logging out.");
                localStorage.removeItem("userInfo"); // Clear invalid/expired token from local storage
                setIsAuthenticated(false);
                setUser(null);
            } else {
                // Handle other potential errors (network issues, JSON parse errors, etc.)
                console.log("[Auth Check] Other error encountered. Logging out for safety.");
                localStorage.removeItem("userInfo"); // Clear for safety
                setIsAuthenticated(false);
                setUser(null);
            }
        } finally {
            setIsLoading(false);
            console.log("[Auth Check] Finished check, isLoading set to false. Final isAuthenticated:", isAuthenticated); // Log final state
        }
    }, []); // checkAuthStatus is wrapped in useCallback, so it's stable as a dependency

    useEffect(() => {
        console.log("[AuthContext] Initial useEffect running, calling checkAuthStatus on mount.");
        checkAuthStatus();
    }, [checkAuthStatus]); // `checkAuthStatus` as a dependency is fine due to useCallback

    const login = (userInfoData) => {
        if (userInfoData && userInfoData.token) {
            localStorage.setItem("userInfo", JSON.stringify(userInfoData));
            setIsAuthenticated(true);
            setUser({ _id: userInfoData._id, username: userInfoData.username, email: userInfoData.email });
            console.log("AuthContext: User logged in, state updated.");
            // No need to call checkAuthStatus here immediately after login,
            // as the state is directly updated, and checkAuthStatus runs on mount.
            // If you want to force a re-check, you could call it, but usually not necessary here.
        } else {
            console.error("AuthContext: login function called without valid userInfoData containing token.");
        }
    };

    const logout = async () => {
        const userInfoString = localStorage.getItem("userInfo");
        let token = null;
        if (userInfoString) { try { token = JSON.parse(userInfoString)?.token; } catch { /* ignore */ } }

        try {
            if (token) {
                // Optional: If you have a backend logout endpoint that invalidates tokens or sessions
                // await axios.post("http://localhost:5000/auth/logout", {}, { headers: { Authorization: `Bearer ${token}` } });
                // console.log("AuthContext: Backend logout called (if implemented).");
            }
        } catch (error) {
            console.error("AuthContext: Backend logout failed:", error);
        } finally {
            localStorage.removeItem("userInfo"); // Always clear local storage on logout
            setIsAuthenticated(false);
            setUser(null);
            console.log("AuthContext: User logged out, state cleared.");
            navigate('/login'); // Redirect to login after logout
        }
    };

    console.log("AuthProvider providing value (on render):", { isAuthenticated, user, isLoading });

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading, checkAuthStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};