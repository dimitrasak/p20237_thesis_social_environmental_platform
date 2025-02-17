import React, { useEffect, useState } from 'react';
import OrganizationSidebar from '../../components/OrganizationSidebar';
import { useNavigate } from 'react-router-dom';
import "../../styles/EventsStyles.css";

function Events() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null); 

    useEffect(() => {
        fetch('https://localhost:7029/api/events/events')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`); 
                }
                return response.json(); 
            })
            .then(data => setEvents(data))
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

                {/* Create New Event Button */}
                <button
                    onClick={handleCreateEvent}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Create New Event
                </button>

                {/* Cards Display with Small Gap */}
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
                                <div className="card-actions">
                                    {/* Edit Button */}
                                    <button
                                        onClick={() => handleEditEvent(event.eventId)}
                                        className="btn-edit"
                                    >
                                        Edit
                                    </button>
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDeleteEvent(event.eventId)}
                                        className="btn-delete"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Events;

