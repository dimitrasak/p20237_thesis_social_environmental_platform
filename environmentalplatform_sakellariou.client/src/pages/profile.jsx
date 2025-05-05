import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import OrganizationSidebar from "../components/OrganizationSidebar";
import RegUserSidebar from "../components/RegUserSidebar";

function Profile() {
    const [profilePic, setProfilePic] = useState("default-profile.jpg");
    const [username, setUsername] = useState("Guest");
    const [role, setRole] = useState("");
    const [stats, setStats] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const storedProfilePic = localStorage.getItem("profilePic") || "default-profile.jpg";
        const storedUsername = localStorage.getItem("username") || "Guest";
        const storedRole = localStorage.getItem("userRole");
        const storedUserId = localStorage.getItem("userId");

        setProfilePic(storedProfilePic);
        setUsername(storedUsername);
        setRole(storedRole);

        console.log("Fetching stats for userId:", storedUserId, "with role:", storedRole);

        if (storedUserId && storedRole) {
            fetchUserStats(storedUserId);
        }
    }, []);

    const fetchUserStats = async (userId) => {
        try {
            const response = await fetch(`https://localhost:7029/api/profile/stats/${userId}`);

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setStats(data);
            setError("");
        } catch (err) {
            console.error("Error fetching stats: ", err);
            setError("Error fetching stats: " + err.message);
        }
    };

    const renderStats = () => {
        const renderStars = (rating) => {
            const filledStars = Math.floor(rating);
            const emptyStars = 5 - filledStars;

            return (
                <div className="star-rating">
                    {Array(filledStars).fill().map((_, i) => (
                        <span key={`filled-${i}`} className="star filled">&#9733;</span>
                    ))}
                    {Array(emptyStars).fill().map((_, i) => (
                        <span key={`empty-${i}`} className="star empty">&#9734;</span>
                    ))}
                </div>
            );
        };
        if (!stats) return <p>Loading stats...</p>;

        if (role === "Regular User") {
            return (
                <>
                    <div className="stat-section">
                        <h4>Event Participation Count: {stats.eventParticipationCount}</h4>
                        <h4>Participated Events:</h4>
                        <ul>
                            {(stats.participatedEventDetails || []).map((event, index) => (
                                <li key={index}>                                    
                                    {event.eventId === 0 ? (
                                        <a
                                            href="https://localhost:53073/event-details/0" 
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="event-link"
                                        >
                                            {event.title}
                                        </a>
                                    ) : (
                                        <a
                                            href={`https://localhost:53073/event-details/${event.eventId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="event-link"
                                        >
                                            {event.title}
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>



                    </div>

                    <div className="stat-section">
                        <h4>Reviews Count: {stats.reviewsCount}</h4>
                        <h4>Posts Count: {stats.postsCount}</h4>
                        <h4>Comments Count: {stats.commentsCount}</h4>
                    </div>
                </>
            );
        } else if (role === "Organization") {
            return (
                <>
                    <div className="stat-section">
                        <h4>Organization Average Rating: {renderStars(stats.orgAverageRating)}</h4>
                        <h4>Event Average Rating: {renderStars(stats.eventAverageRating)}</h4>
                        <h4>General Average Rating: {renderStars(stats.generalAverageRating)}</h4>
                    </div>

                    <div className="stat-section">
                        <h4>Organization Comments:</h4>
                        <div className="comment-bubbles">
                            {(stats.orgComments || []).map((comment, index) => (
                                <div key={index} className="comment-bubble">
                                    <div className="comment-text">
                                        {comment}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="stat-section">
                        <h4>Event Comments:</h4>
                        <div className="comment-bubbles">
                            {(stats.eventComments || []).map((comment, index) => (
                                <div key={index} className="comment-bubble">
                                    <div className="comment-text">
                                        {comment}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="stat-section">
                        <h4>Total Events Organized: {stats.totalEventsOrganized}</h4>
                    </div>

                    <div className="stat-section">
                        <h4>Event Attendance:</h4>
                        <ul>
                            {(stats.eventAttendance || []).map((event, index) => (
                                <li key={index}>                                    
                                    <a
                                        href={`https://localhost:53073/event-details/${event.eventId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="event-link"
                                    >
                                        {event.title ?? "Untitled"}
                                    </a>
                                    - Attendees: {event.attendees ?? 0}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            );
        }

        return <p>Unknown role or no stats available.</p>;
    };



    return (
        <div className="profile-page-container">
            <div className="profile-page-header">
                <img
                    src={`https://localhost:7029/images/${profilePic}`}
                    alt="Profile"
                    className="profile-page-pic"
                />
                <div className="profile-page-info">
                    <h2>{username}</h2>
                    <div className="profile-buttons">
                        <button onClick={() => navigate("/edit-profile")} className="edit-btn">
                            Edit Profile
                        </button>
                        <button onClick={() => navigate("/info-profile")} className="info-btn">
                            View Profile Info
                        </button>
                    </div>
                </div>
            </div>

            <div className="profile-stats">
                <h3>Activity Statistics</h3>
                {error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    renderStats()
                )}
            </div>
        </div>
    );
}

export default Profile;
