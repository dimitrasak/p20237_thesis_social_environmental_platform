import React from 'react';
import OrganizationSidebar from '../../components/OrganizationSidebar';
import { useNavigate } from 'react-router-dom';
import "../../styles/EventsStyles.css";

function AddEvent() {
    const handleCreateEvent = (e) => {
        e.preventDefault(); 
        console.log('Event created!');
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
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="event-date">Date</label>
                        <input
                            type="date"
                            id="event-date"
                            name="eventDate"
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
                        />
                    </div>

                    <button type="submit">Create New Event</button>
                </form>
            </div>
        </div>
    );
}

export default AddEvent;
