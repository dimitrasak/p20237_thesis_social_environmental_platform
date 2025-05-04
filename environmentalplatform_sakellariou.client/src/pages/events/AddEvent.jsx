import React, { useState, useEffect } from 'react';
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
        selectedCategories: [],
    });
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null); // Error state
    const [success, setSuccess] = useState(null); // Success state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('https://localhost:7029/api/categories');
                const data = await response.json();

                if (Array.isArray(data)) {
                    setCategories(data);
                } else if (data.Categories) {
                    // If response is wrapped in an object
                    setCategories(data.Categories);
                } else {
                    throw new Error('Unexpected API response');
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to load categories');
            }
        };

        fetchCategories();
    }, []);

    // Handle category selection
    const handleCategoryChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        console.log("Selected categories:", selectedOptions); // Debugging
        setFormData({ ...formData, selectedCategories: selectedOptions });
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.eventTitle);
        formDataToSend.append('description', formData.eventDescription);
        formDataToSend.append('location', formData.eventLocation);
        formDataToSend.append('date', formData.eventDate);
        formDataToSend.append('requirements', formData.eventRequirements || '');
        
        // Append the image if it exists
        if (formData.eventImage) {
            formDataToSend.append('image', formData.eventImage);
        }

        formData.selectedCategories.forEach(catId => {
            formDataToSend.append('categories', catId); // Append each category separately
        });

        //console.log("Final payload:", Object.fromEntries(formDataToSend));

        try {
            const response = await fetch('https://localhost:7029/api/events/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.errors || 'An error occurred');
            } else {
                const result = await response.json();
                setSuccess('Event created successfully!');
                navigate('/events');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred while creating the event');
        }
    };



    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            {/*<OrganizationSidebar />*/}

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
                        <label htmlFor="event-date-time">Date and Time</label>
                        <input
                            type="datetime-local"
                            id="event-date-time"
                            name="eventDateTime"
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
                    <div className="form-group">
                        <label htmlFor="event-categories">Select Categories</label>
                        <select
                            id="event-categories"
                            multiple
                            value={formData.selectedCategories}
                            onChange={handleCategoryChange}
                        >
                            {categories.length > 0 ? (
                                categories.map(category => (
                                    <option key={category.categoryId} value={category.categoryId}>
                                        {category.name}
                                    </option>
                                ))
                            ) : (
                                <option disabled>Loading categories...</option>
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="event-image">Event Image</label>
                        <input
                            type="file"
                            id="event-image"
                            name="eventImage"
                            accept="image/*"
                            onChange={(e) => setFormData({ ...formData, eventImage: e.target.files[0] })}
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
