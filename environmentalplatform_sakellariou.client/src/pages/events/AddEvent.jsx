import React, { useState } from 'react';
import OrganizationSidebar from '../../components/OrganizationSidebar';
import { useNavigate } from 'react-router-dom';
import "../../styles/EventsStyles.css";

function AddEvent() {
    const [formData, setFormData] = useState({
        eventTitle: '',
        eventDescription: '',
        eventLocation: '',
        eventDate: '',
        eventRequirements: '',
    });
    const [error, setError] = useState(null); // Error state
    const [success, setSuccess] = useState(null); // Success state
    const navigate = useNavigate();

    const handleCreateEvent = async (e) => {
        e.preventDefault();

        // Validate the event date
        const dateValue = formData.eventDate;
        let eventDate = null;

        if (dateValue) {
            eventDate = new Date(dateValue);

            if (isNaN(eventDate.getTime())) {
                setError('Invalid date value.');
                return;
            }

            eventDate = eventDate.toISOString();
        } else {
            setError('Date is required.');
            return;
        }

        // Prepare the data for the API request
        const requestData = {
            title: formData.eventTitle,
            description: formData.eventDescription,
            location: formData.eventLocation,
            date: eventDate,
            requirements: formData.eventRequirements || '', // Send an empty string if not provided
        };

        console.log("Request data: ",requestData);


        try {
            const response = await fetch('https://localhost:7029/api/events/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.errors || 'An error occurred');
            } else {
                const result = await response.json();
                setSuccess('Event created successfully!');
                navigate('/events'); // Navigate to events page (adjust the route as necessary)
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred while creating the event');
        }
    };


    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <OrganizationSidebar />

            {/* Main Content */}
            <div className="main-content">
                <h2 className="main-title">Add Event</h2>
                <form className="event-form" onSubmit={handleCreateEvent}>
                    <div className="form-group">
                        <label htmlFor="event-title">Event Title</label>
                        <input
                            type="text"
                            id="event-title"
                            name="eventTitle"
                            placeholder="Event Title"
                            value={formData.eventTitle}
                            onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="event-description">Description</label>
                        <textarea
                            id="event-description"
                            name="eventDescription"
                            placeholder="Description"
                            rows="4"
                            value={formData.eventDescription}
                            onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="event-location">Location</label>
                        <input
                            type="text"
                            id="event-location"
                            name="eventLocation"
                            placeholder="Location"
                            value={formData.eventLocation}
                            onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="event-date">Date</label>
                        <input
                            type="date"
                            id="event-date"
                            name="eventDate"
                            value={formData.eventDate}
                            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="event-requirements">Requirements</label>
                        <input
                            type="text"
                            id="event-requirements"
                            name="eventRequirements"
                            placeholder="Requirements"
                            value={formData.eventRequirements}
                            onChange={(e) => setFormData({ ...formData, eventRequirements: e.target.value })}
                        />
                    </div>

                    <button type="submit">Create New Event</button>
                </form>

                {/* Display error or success message */}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </div>
        </div>
    );
}

export default AddEvent;
