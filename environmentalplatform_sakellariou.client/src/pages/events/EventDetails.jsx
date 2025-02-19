import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "../../styles/EventsStyles.css";
import OrganizationSidebar from '../../components/OrganizationSidebar';

function EventDetails() {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`https://localhost:7029/api/events/${eventId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch event details.");
                }
                return response.json();
            })
            .then(data => setEvent(data))
            .catch(error => setError(error.message));
    }, [eventId]);

    return (
        <div style={{ display: "flex", height: "100vh", marginTop: "-10px" }}>
            {/* Sidebar */}
            <OrganizationSidebar />

            {/* Main Content */}
            <div className="main-content">
                {error ? (
                    <p className="error-message">{error}</p>
                ) : event ? (
                    <>
                        {/* Event Cover Image */}
                        <div className="event-cover">
                            <img
                                src={`https://localhost:7029${event.imageUrl ? event.imageUrl.replace(/\\/g, '/') : ''}`}
                                alt={event.title}
                            />
                        </div>

                        {/* Event Title */}
                        <div className="event-title-container">
                            <h1 className="event-title">{event.title}</h1>
                        </div>

                        {/* Event Info Card */}
                        <div className="event-info-card">
                            <h3>Event Details</h3>
                            <p><strong>📍 Location:</strong> {event.location}</p>
                            <p><strong>📅 Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                            <p><strong>📖 Description:</strong> {event.description}</p>
                            <p><strong>✅ Requirements:</strong> {event.requirements}</p>
                        </div>

                        {/* Future Section: Event Posts & Comments */}
                    </>
                ) : (
                    <p className="loading-text">Loading...</p>
                )}
            </div>
        </div>
    );
}

export default EventDetails;
