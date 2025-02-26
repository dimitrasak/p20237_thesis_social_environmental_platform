import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegUserDashboard from './reg-user-dashboard';
import OrganizationDashboard from './organization-dashboard';
import AdminDashboard from './admin-dashboard';

function HomePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null); 
    const navigate = useNavigate();

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        const userLoggedIn = localStorage.getItem("username"); 

        if (userLoggedIn) {
            setIsLoggedIn(true);
            setRole(storedRole); 
        }
    }, []);

    if (isLoggedIn) {
        // If the user is logged in, render based on the role
        return (
            <div>
                {role === "Admin" ? (
                    <AdminDashboard />
                ) : role === "Organization" ? (
                    <OrganizationDashboard />
                ) : (
                    <RegUserDashboard />
                )}
            </div>

        );
    }
 
    return (
        <div style={{ textAlign: "center", padding: "50px" }}>
            <h1>Welcome to EcoConnect Platform</h1>
            <p>Join the network and let's try to save our planet.</p>

            <p>Do you already have an account?</p>

            <div style={{ marginTop: "20px" }}>
                <button
                    onClick={() => navigate("/login")}
                    style={{ marginRight: "10px", padding: "10px 20px", fontSize: "16px" }}
                >
                    Login
                </button>
                <button
                    onClick={() => navigate("/register")}
                    style={{ padding: "10px 20px", fontSize: "16px" }}
                >
                    Register
                </button>
            </div>
        </div>
    );
}

export default HomePage;
