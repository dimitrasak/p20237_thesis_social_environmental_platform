import React, { useEffect, useState } from 'react';
import OrganizationSidebar from '../../components/OrganizationSidebar';
import { useNavigate } from 'react-router-dom';
import "../../styles/EventsStyles.css";

function Events() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [role, setRole] = useState(""); // Store the role of the user
    const [userId, setUserId] = useState(null); // Store userId for comparison

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        const storedUserId = localStorage.getItem("userId");

        //console.log("Stored Role:", storedRole); 
        //console.log("Stored UserId:", storedUserId); 

        setRole(storedRole); // Set user role (Organization or other)
        setUserId(storedUserId ? storedUserId : null); // Fallback to null if userId not found

        // Fetch events
        fetch('https://localhost:7029/api/events/events')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                //console.log('Fetched events:', data); // Log the data to inspect it
                setEvents(data);
            })
            .catch(error => {
                console.error('Error fetching events:', error);
                setError(error.message);
            });
    }, []);

    const handleCreateEvent = () => navigate('/add-event');

    const handleEditEvent = (eventId) => navigate(`/edit-event/${eventId}`);

    const handleDeleteEvent = async (eventId) => {
        try {
            const response = await fetch(`https://localhost:7029/api/events/${eventId}`, { method: 'DELETE' });
            if (response.ok) {
                setEvents(events.filter(event => event.eventId !== eventId));
            } else {
                console.error('Failed to delete event');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    return (
        <div className="dashboard-container flex">
            <OrganizationSidebar />
            <div className="main-content flex-1 p-4">
                <h2 className="main-title text-2xl font-bold mb-4">Events</h2>

                {/* Show error message if any */}
                {error && <p className="text-red-500">{error}</p>}

                {/* show Create New Event Button only for Organizations */}
                {role === "Organization" && (
                    <button
                        onClick={handleCreateEvent}
                        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Create New Event
                    </button>
                )}

                <div className="events-grid">
                    {events.map(event => (
                        <div key={event.eventId} className="card">
                            <img
                                src={`https://localhost:7029${event.imageUrl ? event.imageUrl.replace(/\\/g, '/') : ''}` || 'https://picsum.photos/150'}
                                alt={event.title}
                                className="card-img"
                            />
                            <div className="card-body">
                                <h3 className="card-title">{event.title}</h3>
                                <p className="card-location">{event.location} - {new Date(event.date).toLocaleDateString()}</p>
                                <p className="card-description">{event.description}</p>

                                {/* show buttons only if the user is an Organization and the event belongs to them */}
                                {role === "Organization" && event.orgId === Number(userId) &&(
                                    <div className="card-actions">
                                        <button
                                            onClick={() => handleEditEvent(event.eventId)}
                                            className="btn-edit"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event.eventId)}
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
            </div>
        </div>
    );
}

export default Events;
