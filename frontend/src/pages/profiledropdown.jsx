// src/components/ProfileDropdown.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authcontext'; // Import useAuth
import { User, LogOut, History } from 'lucide-react'; // Example icons

const ProfileDropdown = () => {
    const { user, logout } = useAuth(); // Get user info and logout function
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsOpen(false); // Close dropdown first
        logout();         // Call logout from context
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-label="User menu"
                aria-haspopup="true"
            >
                {/* Display User initial or icon */}
                {user?.email ? user.email.charAt(0).toUpperCase() : <User size={20} />}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                >
                    {user?.email && (
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                            Signed in as <br/>
                            <span className='font-medium'>{user.email}</span>
                        </div>
                    )}
                    <Link
                        to="/history" // Link to history page
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setIsOpen(false)} // Close on click
                    >
                         <History size={16} className="mr-2" />
                        History
                    </Link>
                    <button
                        onClick={handleLogout} // Call handleLogout
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                    >
                        <LogOut size={16} className="mr-2" />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;