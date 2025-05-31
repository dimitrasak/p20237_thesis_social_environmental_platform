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
        eventImage: null,
    });

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [remainingCategories, setRemainingCategories] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('https://localhost:7029/api/categories');
                const data = await response.json();
                const categoryList = Array.isArray(data) ? data : data.Categories || [];
                setCategories(categoryList);
                setRemainingCategories(categoryList);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to load categories');
            }
        };

        fetchCategories();
    }, []);

    const handleAddCategory = (e) => {
        const categoryId = parseInt(e.target.value);
        if (!categoryId) return;

        const categoryToAdd = categories.find(cat => cat.categoryId === categoryId);
        if (categoryToAdd && !selectedCategories.some(c => c.categoryId === categoryToAdd.categoryId)) {
            setSelectedCategories([...selectedCategories, categoryToAdd]);
            setRemainingCategories(remainingCategories.filter(cat => cat.categoryId !== categoryId));
        }
    };

    const handleRemoveCategory = (categoryId) => {
        const updatedSelected = selectedCategories.filter(cat => cat.categoryId !== categoryId);
        const removedCategory = categories.find(cat => cat.categoryId === categoryId);
        setSelectedCategories(updatedSelected);
        setRemainingCategories([...remainingCategories, removedCategory]);
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.eventTitle);
        formDataToSend.append('description', formData.eventDescription);
        formDataToSend.append('location', formData.eventLocation);
        formDataToSend.append('date', formData.eventDate);
        formDataToSend.append('requirements', formData.eventRequirements || '');

        if (formData.eventImage) {
            formDataToSend.append('image', formData.eventImage);
        }

        selectedCategories.forEach(cat => {
            formDataToSend.append('categories', cat.categoryId);
        });

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
            {/* <OrganizationSidebar /> */}
            <div className="main-content">
                <h2 className="main-title">Add Event</h2>
                <div className="event-form-container">
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <form className="event-form" onSubmit={handleCreateEvent}>
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                name="eventTitle"
                                value={formData.eventTitle}
                                onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="eventDescription"
                                value={formData.eventDescription}
                                onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Location</label>
                            <input
                                name="eventLocation"
                                value={formData.eventLocation}
                                onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Date and Time</label>
                            <input
                                type="datetime-local"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Requirements</label>
                            <textarea
                                name="eventRequirements"
                                value={formData.eventRequirements}
                                onChange={(e) => setFormData({ ...formData, eventRequirements: e.target.value })}
                                className="input-field"
                            />
                        </div>

                        <div className="form-group">
                            <label>Categories</label>

                            <div className="categories-bubbles">
                                {selectedCategories.map(cat => (
                                    <div key={cat.categoryId} className="category-bubble">
                                        {cat.name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCategory(cat.categoryId)}
                                            className="remove-button"
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <select
                                name="addCategory"
                                onChange={handleAddCategory}
                                className="input-field"
                                defaultValue=""
                            >
                                <option value="" disabled>Select category to add</option>
                                {remainingCategories.map(cat => (
                                    <option key={cat.categoryId} value={cat.categoryId}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Event Image</label>
                            <input
                                type="file"
                                name="eventImage"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, eventImage: e.target.files[0] })}
                            />
                        </div>

                        <button type="submit" className="submit-button">Create New Event</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddEvent;
