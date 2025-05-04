import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/NavigationBar.css';

function NavigationBar() {
    const [username, setUsername] = useState(null);
    const [profilePic, setProfilePic] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const updateUserData = () => {
            const storedUsername = localStorage.getItem('username');
            const storedProfilePic = localStorage.getItem('profilePic');
            setUsername(storedUsername);
            setProfilePic(storedProfilePic || 'default-profile.jpg');
        };

        updateUserData();

        window.addEventListener('storage', updateUserData);
        return () => window.removeEventListener('storage', updateUserData);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setUsername(null);
        setProfilePic(null);
        navigate('/login');
    };

    return (
        <nav className="navbar">
            {/*<button className="mobile-sidebar-toggle" onClick={onToggleSidebar}>
                &#9776;
            </button> */}
            <div className="logo-container">
                <img src="/econnect_logo.png" alt="Econnect Logo" className="navbar-logo" />
            </div>

            <div className="nav-links">
                <li><Link to="/">Homepage</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                {!username && (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </>
                )}
            </div>

            {username && (
                <div className="navbar-right">
                    <div className="profile-container" onClick={() => navigate('/profile')}>
                        <img
                            src={`https://localhost:7029/images/${profilePic}`}
                            alt="Profile"
                            className="profile-pic"
                        />
                    </div>
                    <span className="username">{username}</span>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </div>
            )}
        </nav>
    );
}


export default NavigationBar;
