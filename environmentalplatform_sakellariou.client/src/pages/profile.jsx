import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Profile.css";

function Profile() {
    const { id } = useParams(); // user id from URL if present
    const navigate = useNavigate();

    const [profilePic, setProfilePic] = useState("default-profile.jpg");
    const [username, setUsername] = useState("Guest");
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [details, setDetails] = useState(null);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Determine if viewing own profile (no id param)
    const isOwnProfile = !id;

    useEffect(() => {
        async function fetchUserProfile(userId) {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`https://localhost:7029/api/users/${userId}`);
                if (!response.ok) throw new Error("Failed to fetch user profile");

                const data = await response.json();

                setProfilePic(data.profilePic || "default-profile.jpg");
                setUsername(data.username || "Unknown User");
                setRole(data.role || "Unknown");
                setDetails(data.details || null);
                setEmail(data.email || "N/A");

                // Fetch stats only if NOT Admin
                if (data.role !== "Admin") {
                    fetchUserStats(userId);
                } else {
                    setStats(null);
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
                setError("Error fetching user profile: " + err.message);
                setStats(null);
            } finally {
                setLoading(false);
            }
        }

        async function fetchUserStats(userId) {
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
                console.error("Error fetching stats:", err);
                setError("Error fetching stats: " + err.message);
                setStats(null);
            }
        }

        // Get userId to fetch: from param or localStorage
        let userIdToFetch = id;
        if (!userIdToFetch) {
            const storedId = localStorage.getItem("userId");
            if (!storedId) {
                setError("No user ID available.");
                setLoading(false);
                return;
            }
            userIdToFetch = storedId;
        }

        // Convert to number, check validity
        userIdToFetch = Number(userIdToFetch);
        if (isNaN(userIdToFetch)) {
            setError("Invalid user ID.");
            setLoading(false);
            return;
        }

        fetchUserProfile(userIdToFetch);
    }, [id]);

    // Helper to render stars for ratings
    const renderStars = (rating) => {
        const filledStars = Math.floor(rating);
        const emptyStars = 5 - filledStars;

        return (
            <div className="star-rating">
                {Array(filledStars)
                    .fill()
                    .map((_, i) => (
                        <span key={`filled-${i}`} className="star filled">
                            &#9733;
                        </span>
                    ))}
                {Array(emptyStars)
                    .fill()
                    .map((_, i) => (
                        <span key={`empty-${i}`} className="star empty">
                            &#9734;
                        </span>
                    ))}
            </div>
        );
    };

    // Render stats depending on role
    const renderStats = () => {
        if (!stats) return <p>Loading stats...</p>;

        if (role === "Regular User") {
            return (
                <>
                    <div className="stat-section">
                        <h4>Event Participation Count: {stats.eventParticipationCount ?? 0}</h4>
                        <h4>Participated Events:</h4>
                        <ul>
                            {(stats.participatedEventDetails || []).map((event, index) => (
                                <li key={index}>
                                    <a
                                        href={`https://localhost:53073/event-details/${event.eventId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="event-link"
                                    >
                                        {event.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="stat-section">
                        <h4>Reviews Count: {stats.reviewsCount ?? 0}</h4>
                        <h4>Posts Count: {stats.postsCount ?? 0}</h4>
                        <h4>Comments Count: {stats.commentsCount ?? 0}</h4>
                    </div>
                </>
            );
        } else if (role === "Organization") {
            return (
                <>
                    <div className="stat-section">
                        <h4>Organization Average Rating: {renderStars(stats.orgAverageRating ?? 0)}</h4>
                        <h4>Event Average Rating: {renderStars(stats.eventAverageRating ?? 0)}</h4>
                        <h4>General Average Rating: {renderStars(stats.generalAverageRating ?? 0)}</h4>
                    </div>

                    <div className="stat-section">
                        <h4>Organization Comments:</h4>
                        <div className="comment-bubbles">
                            {(stats.orgComments || []).map((comment, index) => (
                                <div key={index} className="comment-bubble">
                                    <div className="comment-text">{comment}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="stat-section">
                        <h4>Event Comments:</h4>
                        <div className="comment-bubbles">
                            {(stats.eventComments || []).map((comment, index) => (
                                <div key={index} className="comment-bubble">
                                    <div className="comment-text">{comment}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="stat-section">
                        <h4>Total Events Organized: {stats.totalEventsOrganized ?? 0}</h4>
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
                                    {" - "}Attendees: {event.attendees ?? 0}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            );
        }
        return <p>Unknown role or no stats available.</p>;
    };

    // Render profile details
    const renderProfileDetails = () => {
        return (
            <div className="profile-info">
                <p>
                    <strong>Username:</strong> {username}
                </p>
                <p>
                    <strong>Email:</strong> {email || "N/A"}
                </p>
                <p>
                    <strong>Role:</strong> {role}
                </p>
                {role === "Admin" && (
                    <p>
                        <strong>Contact:</strong> For support, contact: admin@econnect.com or call +30 698 098 4080
                    </p>
                )}
                
                
            </div>
        );
    };

    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

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
                    {isOwnProfile && (
                        <div className="profile-buttons">
                            <button onClick={() => navigate("/edit-profile")} className="edit-btn">
                                Edit Profile
                            </button>
                            <button onClick={() => navigate("/info-profile")} className="info-btn">
                                View Profile Info
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-details-section">
                <h3>Profile Details</h3>
                {renderProfileDetails()}
            </div>

            {/* Show stats section for non-Admin */}
            {role !== "Admin" && (
                <div className="profile-stats">
                    <h3>Activity Statistics</h3>
                    {error ? <p className="error-message">{error}</p> : renderStats()}
                </div>
            )}
        </div>
    );
}

export default Profile;
