import React, { useEffect, useState } from 'react';
import OrganizationSidebar from '../../components/OrganizationSidebar';
import { useNavigate } from 'react-router-dom';
import "../../styles/EventsStyles.css";

function OrganizationEvents() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [role, setRole] = useState("");
    const [userId, setUserId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [showPastEvents, setShowPastEvents] = useState(false); // NEW STATE

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        const storedUserId = localStorage.getItem("userId");

        setRole(storedRole);
        setUserId(storedUserId ? storedUserId : null);

        // Fetch all events, then filter by org ID
        fetch('https://localhost:7029/api/events/events')
            .then(response => response.json())
            .then(data => {
                const filteredEvents = data.filter(event => event.orgId === Number(storedUserId));
                setEvents(filteredEvents);
            })
            .catch(error => {
                setError(error.message);
            });
    }, []);

    const handleCreateEvent = () => navigate('/add-event');
    const handleEditEvent = (eventId) => navigate(`/edit-event/${eventId}`);
    const handleConfirmDelete = async () => {
        try {
            const response = await fetch(`https://localhost:7029/api/events/${eventToDelete.eventId}`, {
                method: 'DELETE'
            });
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

    // Filter out past events unless toggle is enabled
    const now = new Date();
    const filteredEvents = showPastEvents
        ? events
        : events.filter(event => new Date(event.date) >= now);

    return (
        <div className="dashboard-container flex">
            {/* <OrganizationSidebar /> */}
            <div className="main-content flex-1 p-4">
                <h2 className="main-title text-2xl font-bold mb-4">Your Organization's Events</h2>

                {role === "Organization" && (
                    <div className="create-event-btn-container mb-4">
                        <button
                            onClick={handleCreateEvent}
                            className="create-event-btn"
                        >
                            Create New Event
                        </button>
                    </div>
                )}

                

                {filteredEvents.length === 0 && (
                    <div className="no-events-message">
                        <p>No {showPastEvents ? "" : "upcoming "}events available for your organization.</p>
                    </div>
                )}

                {/* Events Grid */}
                <div className="events-grid">
                    {filteredEvents.map(event => (
                        <div
                            key={event.eventId}
                            className="card clickable-card"
                            onClick={() => navigate(`/event-details/${event.eventId}`)}
                        >
                            <img
                                src={`https://localhost:7029${event.imageUrl ? event.imageUrl.replace(/\\/g, '/') : ''}` || 'https://picsum.photos/150'}
                                alt={event.title}
                                className="card-img"
                            />
                            <div className="card-body">
                                <h3 className="card-title">{event.title}</h3>
                                <p className="card-location">{event.location} - {new Date(event.date).toLocaleDateString()}</p>
                                <p className="card-description">{event.description}</p>

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
                {/* Toggle Past Events */}
                <div className="show-past-toggle mb-4">
                    <button
                        onClick={() => setShowPastEvents(!showPastEvents)}
                        className="btn-toggle-past-events"
                    >
                        {showPastEvents ? "Hide Past Events" : "Show Past Events"}
                    </button>
                </div>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <h3>Are you sure you want to delete this event?</h3>
                            <div className="modal-actions">
                                <button
                                    onClick={handleConfirmDelete}
                                    className="btn-confirm"
                                >
                                    Yes, Delete
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="btn-cancel"
                                >
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

export default OrganizationEvents;
