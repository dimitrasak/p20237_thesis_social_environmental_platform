import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: "center", padding: "50px" }}>
            <h1>Welcome to EcoConnect Platform</h1>
            <p>Join the network and let's try to save our planet.</p>

            <p>Do you already have an account?</p>

            <div style={{ marginTop: "20px" }}>
                <button
                    onClick={() => navigate("/login")}
                    style={{ marginRight: "10px", padding: "10px 20px", fontSize: "16px" }}>
                    Login
                </button>
                <button
                    onClick={() => navigate("/register")}
                    style={{ padding: "10px 20px", fontSize: "16px" }}>
                    Register
                </button>
            </div>
        </div>
    );
}

export default HomePage;
