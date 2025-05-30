import React, { useEffect, useState } from 'react';
import OrganizationSidebar from '../../components/OrganizationSidebar';
import RegUserSidebar from '../../components/RegUserSidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import "../../styles/EventsStyles.css";

function Events() {
    const navigate = useNavigate();
    const location = useLocation();

    // Helper to get 'category' from query string
    const getCategoryFromQuery = () => {
        const params = new URLSearchParams(location.search);
        return params.get('category'); // string or null
    };

    const [category, setCategory] = useState(getCategoryFromQuery());
    const [categoryName, setCategoryName] = useState(null);
    const [categories, setCategories] = useState([]);  // all categories list
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [role, setRole] = useState("");
    const [userId, setUserId] = useState(null);
    const [showModal, setShowModal] = useState(false); // For showing/hiding the modal
    const [eventToDelete, setEventToDelete] = useState(null); // The event to be deleted

    // New state to toggle past events visibility
    const [showPastEvents, setShowPastEvents] = useState(false);

    // Fetch all categories on mount
    useEffect(() => {
        fetch('https://localhost:7029/api/categories')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch categories');
                return res.json();
            })
            .then(data => {
                setCategories(data);
            })
            .catch(err => {
                console.error(err);
                setCategories([]);
            });
    }, []);

    // Fetch category name if category ID exists
    useEffect(() => {
        if (category) {
            fetch(`https://localhost:7029/api/categories/${category}`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch category name');
                    return res.json();
                })
                .then(data => {
                    setCategoryName(data.name);
                })
                .catch(err => {
                    console.error(err);
                    setCategoryName(null);
                });
        } else {
            setCategoryName(null);
        }
    }, [category]);

    // Update category state when URL changes
    useEffect(() => {
        setCategory(getCategoryFromQuery());
    }, [location.search]);

    // Set role and userId from localStorage once on mount
    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        const storedUserId = localStorage.getItem("userId");

        setRole(storedRole);
        setUserId(storedUserId ? storedUserId : null);
    }, []);

    // Fetch events, filtered by category if present
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                let url = 'https://localhost:7029/api/events/events';
                if (category) {
                    url += `?category=${category}`;
                }
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setEvents(data);
                setError(null);
            } catch (error) {
                console.error('Error fetching events:', error);
                setError(error.message);
            }
        };

        fetchEvents();
    }, [category]);

    const handleCreateEvent = () => navigate('/add-event');

    const handleEditEvent = (eventId) => navigate(`/edit-event/${eventId}`);

    const handleConfirmDelete = async () => {
        try {
            const response = await fetch(`https://localhost:7029/api/events/${eventToDelete.eventId}`, { method: 'DELETE' });
            if (response.ok) {
                setEvents(events.filter(event => event.eventId !== eventToDelete.eventId));
                setShowModal(false);
            } else {
                console.error('Failed to delete event');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleOpenDeleteModal = (event) => {
        setEventToDelete(event);
        setShowModal(true);
    };

    const handleViewEventDetails = (eventId) => {
        navigate(`/event-details/${eventId}`);
    };

    const clearCategoryFilter = () => {
        navigate('/events');
    };

    // When dropdown changes, update URL query string
    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        if (selectedCategory === "") {
            navigate('/events'); // no filter
        } else {
            navigate(`/events?category=${selectedCategory}`);
        }
    };

    // Filter out past events unless showPastEvents is true
    const now = new Date();

    const filteredEvents = showPastEvents
        ? events
        : events.filter(event => new Date(event.date) >= now);

    return (
        <div className="dashboard-container flex">
            <div className="main-content flex-1 p-4">
                <h2 className="main-title text-2xl font-bold mb-4">Events</h2>

                {/* Show current category filter and option to clear */}
                {category ? (
                    <div className="mb-4">
                        <span>Filtering by Category: <strong>{categoryName || category}</strong></span>
                        <button
                            onClick={clearCategoryFilter}
                            className="btn-clear-filter"
                            style={{ marginLeft: '10px' }}
                        >
                            Clear Filter
                        </button>
                    </div>
                ) : (
                    // Show dropdown only if no filter applied
                    <div className="mb-4">
                        <label htmlFor="categorySelect">Filter by Category: </label>
                        <select
                            id="categorySelect"
                            onChange={handleCategoryChange}
                            defaultValue=""
                            className="category-dropdown"
                        >
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat.categoryId} value={cat.categoryId}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Create New Event Button */}
                {role === "Organization" && (
                    <div className="create-event-btn-container">
                        <button
                            onClick={handleCreateEvent}
                            className="create-event-btn"
                        >
                            Create New Event
                        </button>
                    </div>
                )}

                <div className="events-grid">
                    {filteredEvents.map(event => (
                        <div
                            key={event.eventId}
                            className="card clickable-card"
                            onClick={() => handleViewEventDetails(event.eventId)}
                        >
                            <img
                                src={`https://localhost:7029${event.imageUrl ? event.imageUrl.replace(/\\/g, '/') : ''}` || 'https://picsum.photos/150'}
                                alt={event.title}
                                className="card-img"
                            />
                            <div className="card-body">
                                <h3 className="card-title">{event.title}</h3>
                                <p className="card-location">
                                    {event.location} - {new Date(event.date).toLocaleDateString()}
                                </p>
                                <p className="card-description">{event.description}</p>

                                {/* Show edit/delete buttons if user is Organization & owns event */}
                                {role === "Organization" && event.orgId === Number(userId) && (
                                    <div className="card-actions">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditEvent(event.eventId);
                                            }}
                                            className="btn-edit"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenDeleteModal(event);
                                            }}
                                            className="btn-delete"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <br></br>
                {/* Toggle button to show/hide past events */}
                <div className="show-past-toggle mb-4">
                    <button
                        onClick={() => setShowPastEvents(!showPastEvents)}
                        className="btn-toggle-past-events"
                    >
                        {showPastEvents ? "Hide Past Events" : "Show Past Events"}
                    </button>
                </div>

                {/* Modal for deleting event confirmation */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <h3>Are you sure you want to delete this event?</h3>
                            <div className="modal-actions">
                                <button onClick={handleConfirmDelete} className="btn-confirm">
                                    Yes, Delete
                                </button>
                                <button onClick={() => setShowModal(false)} className="btn-cancel">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Events;
