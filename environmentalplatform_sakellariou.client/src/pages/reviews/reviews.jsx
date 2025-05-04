import React, { useEffect, useState } from 'react';
import OrganizationSidebar from '../../components/OrganizationSidebar';
import RegUserSidebar from '../../components/RegUserSidebar';
import { useNavigate } from 'react-router-dom';
import "../../styles/ReviewsStyles.css";

function Reviews() {
    const [role, setRole] = useState("");
    const [userId, setUserId] = useState("");
    const [reviews, setReviews] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState("event"); // "event" or "organization"
    const [formData, setFormData] = useState({
        selectedTargetId: "",
        rating: "5",
        comment: ""
    });
    const [selectedReview, setSelectedReview] = useState(null);
    const [filterType, setFilterType] = useState("All");
    const [events, setEvents] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        const storedUserId = localStorage.getItem("userId");

        setRole(storedRole);
        setUserId(storedUserId);

        if (storedRole && storedUserId) {
            fetchReviews(storedRole, storedUserId);
        }
    }, []);

    const fetchReviews = async (userRole, id) => {
        try {
            const baseUrl = "https://localhost:7029";

            const endpoint = userRole === "Organization"
                ? `${baseUrl}/api/Reviews/org/${id}`
                : `${baseUrl}/api/Reviews/user/${id}`;

            const response = await fetch(endpoint);
            if (!response.ok) throw new Error("Failed to fetch reviews");

            const data = await response.json();
            setReviews(data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const eventResponse = await fetch('https://localhost:7029/api/Reviews/events');
            const eventsData = await eventResponse.json();
            setEvents(eventsData);

            const orgResponse = await fetch('https://localhost:7029/api/Reviews/organizations');
            const orgData = await orgResponse.json();
            setOrganizations(orgData);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    useEffect(() => {
        if (showModal && role !== "Organization") {
            fetchDropdownData();
        }
    }, [showModal, role]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        setFormData({ selectedTargetId: "", rating: "5", comment: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (role === "Organization") {
            console.warn("Organizations are not allowed to submit reviews.");
            return;
        }

        const reviewData = {
            userId: parseInt(userId),
            eventId: activeTab === "event" ? parseInt(formData.selectedTargetId) : null,
            orgId: activeTab === "organization" ? parseInt(formData.selectedTargetId) : null,
            targetUserId: null,
            rating: formData.rating,
            comment: formData.comment
        };

        try {
            const response = await fetch("https://localhost:7029/api/Reviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(reviewData)
            });

            if (!response.ok) throw new Error("Failed to submit review");

            await fetchReviews(role, userId);
            closeModal();
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };

    const openModal = () => {
        if (role !== "Organization") {
            setShowModal(true);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ selectedTargetId: "", rating: "5", comment: "" });
        setActiveTab("event");
    };

    const handleViewReview = (reviewId) => {
        const review = reviews.find(r => r.reviewId === reviewId);
        setSelectedReview(review);
    };

    return (
        <div className="dashboard-container flex">
            {role === "Organization" ? <OrganizationSidebar /> : <RegUserSidebar />}

            <div className="main-content flex-1 p-4 reviews-page">
                <div className="reviews-header">
                    <h2>Reviews Administration Page</h2>
                    {role !== "Organization" && (
                        <button onClick={openModal} className="add-review-btn">
                            Add Review
                        </button>
                    )}
                </div>

                {reviews.length === 0 ? (
                    <div className="no-reviews-message">No reviews yet.</div>
                ) : (
                    <>
                        <div className="reviews-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 className="past-reviews-header">Past Reviews</h3>
                            <div className="filter-section">
                                <label style={{ marginRight: '0.5rem' }}>Filter by Type:</label>
                                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                    <option value="All">All</option>
                                    <option value="Event">Event</option>
                                    <option value="Organization">Organization</option>
                                </select>
                            </div>
                        </div>

                        <div className="reviews-grid">
                            {reviews
                                .filter(review => filterType === "All" || review.entityType === filterType)
                                .map(review => (
                                    <div key={review.reviewId} className="review-card">
                                        <div>
                                            <div className="review-title">{review.title || "Review"}</div>
                                            <div className="review-target">
                                                {review.reviewedEntity && (
                                                    <span>
                                                        {review.entityType === "Event" ? (
                                                            <>For Event: <strong>{review.reviewedEntity}</strong></>
                                                        ) : (
                                                            <>For Organization: <strong>{review.reviewedEntity}</strong>
                                                                {review.organizationUsername && ` (${review.organizationUsername})`}
                                                            </>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="review-rating">⭐ {review.rating}/5</div>
                                            <div className="review-description">
                                                {review.comment.length > 30 ? `${review.comment.slice(0, 40)}...` : review.comment}
                                            </div>
                                        </div>
                                        <div className="review-footer">
                                            <button className="btn-details" onClick={() => handleViewReview(review.reviewId)}>
                                                Show More
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </>
                )}
            </div>

            {showModal && role !== "Organization" && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Add Review</h3>
                            <button onClick={closeModal} className="close-btn">✕</button>
                        </div>

                        <div className="modal-tabs">
                            <button
                                className={activeTab === "event" ? "tab active" : "tab"}
                                onClick={() => handleTabSwitch("event")}
                            >
                                Review Event
                            </button>
                            <button
                                className={activeTab === "organization" ? "tab active" : "tab"}
                                onClick={() => handleTabSwitch("organization")}
                            >
                                Review Organization
                            </button>
                        </div>

                        <form className="review-form" onSubmit={handleSubmit}>
                            <label>
                                {activeTab === "event" && "Select Event:"}
                                {activeTab === "organization" && "Select Organization:"}
                                <select
                                    name="selectedTargetId"
                                    value={formData.selectedTargetId}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select...</option>
                                    {activeTab === "event" && events.map(event => (
                                        <option key={event.eventId} value={event.eventId}>{event.title}</option>
                                    ))}
                                    {activeTab === "organization" && organizations.map(org => (
                                        <option key={org.organisationId} value={org.organisationId}>
                                            {org.name} ({org.username})
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Rating:
                                <select name="rating" value={formData.rating} onChange={handleInputChange}>
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Comment:
                                <textarea
                                    name="comment"
                                    value={formData.comment}
                                    onChange={handleInputChange}
                                    placeholder="Write your review here..."
                                    required
                                />
                            </label>

                            <div className="modal-actions">
                                <button type="button" onClick={closeModal} className="btn-cancel">Cancel</button>
                                <button type="submit" className="btn-submit">Submit Review</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedReview && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Review Details</h3>
                            <button onClick={() => setSelectedReview(null)} className="close-btn">✕</button>
                        </div>

                        <div className="review-full-content">
                            <p><strong>Target:</strong> {selectedReview.entityType === "Event"
                                ? `Event - ${selectedReview.reviewedEntity}`
                                : `Organization - ${selectedReview.reviewedEntity} (${selectedReview.organizationUsername})`}
                            </p>
                            <p><strong>Rating:</strong> ⭐ {selectedReview.rating}/5</p>
                            <p><strong>Comment:</strong> {selectedReview.comment}</p>
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setSelectedReview(null)} className="btn-close">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reviews;
