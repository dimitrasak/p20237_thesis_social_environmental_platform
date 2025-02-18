import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/NavigationBar.css';

function NavigationBar() {
    const [username, setUsername] = useState(null);
    const [profilePic, setProfilePic] = useState(null); // State to store profile picture
    const navigate = useNavigate();

    useEffect(() => {
        const updateUserData = () => {
            const storedUsername = localStorage.getItem('username');
            const storedProfilePic = localStorage.getItem('profilePic');
            setUsername(storedUsername);
            // Set the profile picture or default to 'default-profile.jpg' if not available
            setProfilePic(storedProfilePic || 'default-profile.jpg');
        };

        updateUserData();

        // Listen to changes in localStorage
        window.addEventListener('storage', updateUserData);
        return () => {
            window.removeEventListener('storage', updateUserData);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        localStorage.removeItem('profilePic');
        setUsername(null);
        setProfilePic(null); // Clear profilePic from state as well
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="logo-container">
                {/* Logo image */}
                <img src="/econnect_logo.png" alt="Econnect Logo" className="navbar-logo" />
            </div>
            <ul className="nav-links">
                
                <li><Link to="/">Homepage</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                {!username ? (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </>
                ) : (
                    <>
                        {/* Display the profile picture */}
                        <li className="profile-container" onClick={() => navigate('/profile')}>
                            <img
                                src={`https://localhost:7029/images/${profilePic}`}
                                alt="Profile"
                                className="profile-pic"
                            />
                        </li>
                        <li className="username">{username}</li>
                        <li><button onClick={handleLogout}>Logout</button></li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default NavigationBar;
