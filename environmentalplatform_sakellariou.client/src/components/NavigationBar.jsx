import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/NavigationBar.css';

function NavigationBar() {
    const [username, setUsername] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const updateUserData = () => {
            const storedUsername = localStorage.getItem('username');
            setUsername(storedUsername);
        };

        updateUserData();

        // Παρακολούθηση αλλαγών στο localStorage
        window.addEventListener('storage', updateUserData);
        return () => {
            window.removeEventListener('storage', updateUserData);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        setUsername(null);
        navigate('/login');
    };

    return (
        <nav className="navbar">
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
                            <li className="username">{username}</li>
                        <li><button onClick={handleLogout}>Logout</button></li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default NavigationBar;
