import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css"; 

function Profile() {
    const [profilePic, setProfilePic] = useState("default-profile.jpg");
    const [username, setUsername] = useState("Guest");
    const [role, setRole] = useState(""); //store the role from localstorage
    const navigate = useNavigate();

    useEffect(() => {
        const storedProfilePic = localStorage.getItem("profilePic") || "default-profile.jpg";
        const storedUsername = localStorage.getItem("username") || "Guest";
        const storedRole = localStorage.getItem("userRole");


        setProfilePic(storedProfilePic);
        setUsername(storedUsername);
        setRole(storedRole); 
        
    }, []);

    return (
        <div className="profile-page-container">
            <div className="profile-page-header">
                <img src={`https://localhost:7029/images/${profilePic}`} alt="Profile" className="profile-page-pic" />
                <div className="profile-page-info">
                    <h2>{username}</h2>
                    <div className="profile-buttons">
                        <button onClick={() => navigate("/edit-profile")} className="edit-btn">Edit Profile</button>
                        <button onClick={() => navigate("/info-profile")} className="info-btn">View Profile Info</button>
                    </div>
                </div>
            </div>

            <div className="profile-stats">
                <h3>Activity Statistics (Coming Soon)</h3>
            </div>
        </div>
    );
}

export default Profile;
