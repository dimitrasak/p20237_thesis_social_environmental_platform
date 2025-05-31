import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Homepage.css';

function HomePage() {
    const navigate = useNavigate();

    useEffect(() => {
        const userLoggedIn = localStorage.getItem("username");
        const role = localStorage.getItem("userRole");

        if (userLoggedIn) {
            if (role === "Admin") navigate("/admin-dashboard");
            else if (role === "Organization") navigate("/organization-dashboard");
            else navigate("/reg-user-dashboard");
        }
    }, [navigate]);

    return (
        <>
            <div className="hero-section">
                <div className="hero-content">
                    <h1>
                        Welcome to <img src="/EConnect_transparent_all_white.png" alt="Econnect Platform Logo" className="navbar-logo-home" />Platform
                    </h1>
                    <p>Join the network and let's try to save our planet.</p>
                    <div className="button-group">
                        <button onClick={() => navigate("/login")}>Login</button>
                        <button onClick={() => navigate("/register")}>Register</button>
                    </div>
                </div>
            </div>

            <section className="mission-section">
                <h2>Why Join <img src="/EConnect_logo_transparent.png" alt="Econnect Platform Logo" className="navbar-logo-home" />?</h2>
                <p>
                    Be part of a community dedicated to protecting the environment through action, education, and collaboration.
                </p>
                <ul>
                    <li>Connect with like-minded eco-warriors</li>
                    <li>Participate in local and global environmental events</li>
                    <li>Get exclusive tips and resources</li>
                </ul>
            </section>
        </>
    );
}

export default HomePage;
