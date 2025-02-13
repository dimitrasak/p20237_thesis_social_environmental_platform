import React, { useState, useEffect } from "react";
import "../styles/EditProfile.css"; // Reusing the same CSS layout

const InfoProfile = () => {
    const [profilePic, setProfilePic] = useState("default-profile.jpg");
    const [username, setUsername] = useState("Guest");
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get profilePic and username from localStorage
    useEffect(() => {
        const storedProfilePic = localStorage.getItem("profilePic") || "default-profile.jpg";
        const storedUsername = localStorage.getItem("username") || "Guest";
        setProfilePic(storedProfilePic);
        setUsername(storedUsername);
    }, []);

    // Fetch the user info using your GET endpoint
    useEffect(() => {
        fetch("https://localhost:7029/api/users/profile", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch user info");
                }
                return response.json();
            })
            .then((data) => {
                setUserInfo(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching user info:", err);
                setError("Error fetching user info");
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    // Destructure using the same property names from the API response
    const { userId, username: fetchedUsername, email, role, details } = userInfo;

    return (
        <div className="info-profile-container">
            <div className="info-profile-left">
                <img src={`https://localhost:7029/images/${profilePic}`} alt="Profile" className="info-profile-pic" />
                <h2 className="info-profile-username">{username}</h2>
            </div>
            <div className="info-profile-right">
                <div className="info-profile-card">
                    <h2 className="info-profile-title">User Information</h2>
                    <table class="info-profile-table">
                        <tbody>
                            <tr><th>User ID</th><td>{userId}</td></tr>
                            <tr><th>Username</th><td>{fetchedUsername}</td></tr>
                            <tr><th>Email</th><td>{email}</td></tr>
                            <tr><th>Role</th><td>{role}</td></tr>
                            {role === "Regular User" && details && (
                                <>
                                    <tr><th>Name</th><td>{details.name}</td></tr>
                                    <tr><th>Surname</th><td>{details.surname}</td></tr>
                                    <tr><th>Profession</th><td>{details.profession}</td></tr>
                                    <tr><th>Date of Birth</th><td>{details.dateOfBirth}</td></tr>
                                </>
                            )}
                            {role === "Organization" && details && (
                                <>
                                    <tr><th>Organization Name</th><td>{details.name}</td></tr>
                                    <tr><th>AFM</th><td>{details.afm}</td></tr>
                                    <tr><th>Website</th>
                                        <td>
                                            <a href={details.website} target="_blank" rel="noopener noreferrer">
                                                {details.website}
                                            </a>
                                        </td>
                                    </tr>
                                    <tr><th>Headquarters</th><td>{details.headquarters}</td></tr>
                                    <tr><th>Aim</th><td>{details.aim}</td></tr>
                                    <tr><th>Legal Form</th><td>{details.legalForm}</td></tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default InfoProfile;
