import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../../styles/EventsStyles.css";
import OrganizationSidebar from '../../components/OrganizationSidebar';

function EditEvent() {
    const { id } = useParams(); // Get event ID from URL
    const navigate = useNavigate();
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        location: '',
        date: '',
        requirements: '',
        image: null,
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch event details
        fetch(`https://localhost:7029/api/events/${id}`)
            .then(response => response.json())
            .then(data => setEventData(data))
            .catch(err => setError("Failed to load event details."));
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData({ ...eventData, [name]: value });
    };

    const handleImageChange = (e) => {
        setEventData({ ...eventData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(eventData).forEach(key => {
            if (eventData[key]) {
                formData.append(key, eventData[key]);
            }
        });

        try {
            const response = await fetch(`https://localhost:7029/api/events/${id}`, {
                method: 'PUT',
                body: formData,  // No need to set headers for multipart/form-data, the browser handles that
            });
            if (response.ok) {
                navigate('/events'); // Redirect to events page
            } else {
                setError("Failed to update event.");
            }
        } catch (err) {
            setError("An error occurred while updating the event.");
        }
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <OrganizationSidebar />

            {/* Main Content */}
            <div className="main-content">
                <h2 className="main-title">Edit Event</h2>
                <div className="event-form-container">
                    {error && <p className="error-message">{error}</p>}
                    <form className="event-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                name="title"
                                value={eventData.title}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={eventData.description}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input
                                name="location"
                                value={eventData.location}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                name="date"
                                value={eventData.date}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Requirements</label>
                            <textarea
                                name="requirements"
                                value={eventData.requirements}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Event Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                        <button type="submit" className="submit-button">Update Event</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditEvent;
