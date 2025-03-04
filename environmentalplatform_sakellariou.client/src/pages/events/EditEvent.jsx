import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../../styles/EventsStyles.css";
import OrganizationSidebar from '../../components/OrganizationSidebar';

function EditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        location: '',
        date: '',
        requirements: '',
        image: null,
        eventCategories: [],
    });
    const [error, setError] = useState(null);
    const [allCategories, setAllCategories] = useState([]);
    const [remainingCategories, setRemainingCategories] = useState([]);

    useEffect(() => {
        fetch(`https://localhost:7029/api/events/${id}`)
            .then(response => response.json())
            .then(data => {
                console.log("Fetched event data:", data);

                setEventData({
                    ...data,
                    eventCategories: data.eventCategories || [],
                });

                console.log("Event categories loaded:", data.eventCategories || []);
            })
            .catch(err => setError("Failed to load event details."));
    }, [id]);


    // Fetch all categories and set remaining categories
    useEffect(() => {
        fetch('https://localhost:7029/api/categories')
            .then(response => response.json())
            .then(data => {
                console.log("Fetched all categories:", data);
                setAllCategories(data);  // Store all categories with details like name and description
            })
            .catch(err => setError("Failed to load categories."));
    }, []);

    useEffect(() => {
        const selectedIds = eventData.eventCategories.map(cat => cat.categoryId);
        const remaining = allCategories.filter(cat => !selectedIds.includes(cat.categoryId));
        setRemainingCategories(remaining);

        console.log("Selected categories (bubbles):", eventData.eventCategories);
        console.log("Remaining categories (dropdown):", remaining);
    }, [allCategories, eventData.eventCategories]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData({ ...eventData, [name]: value });
    };

    const handleImageChange = (e) => {
        setEventData({ ...eventData, image: e.target.files[0] });
    };

    const handleRemoveCategory = async (categoryId) => {
        try {
            await fetch(`https://localhost:7029/api/events/${id}/categories/${categoryId}`, {
                method: 'DELETE',
            });
            const updatedCategories = eventData.eventCategories.filter(cat => cat.categoryId !== categoryId);
            setEventData({ ...eventData, eventCategories: updatedCategories });
        } catch (error) {
            setError("Failed to remove category.");
        }
    };

    const handleAddCategory = async (e) => {
        const categoryId = parseInt(e.target.value);
        if (!categoryId) return;

        try {
            await fetch(`https://localhost:7029/api/events/${id}/categories`, {
                method: 'POST',
                body: JSON.stringify({ categoryId }),
                headers: { 'Content-Type': 'application/json' },
            });

            const addedCategory = allCategories.find(cat => cat.categoryId === categoryId);

            setEventData({
                ...eventData,
                eventCategories: [...eventData.eventCategories, addedCategory],
            });

            setRemainingCategories(remainingCategories.filter(cat => cat.categoryId !== categoryId));
        } catch (error) {
            setError("Failed to add category.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('Title', eventData.title);
        formData.append('Description', eventData.description);
        formData.append('Location', eventData.location);
        formData.append('Date', eventData.date);
        formData.append('Requirements', eventData.requirements);
        if (eventData.image) {
            formData.append('Image', eventData.image);
        }

        try {
            const response = await fetch(`https://localhost:7029/api/events/${id}`, {
                method: 'PUT',
                body: formData,
            });

            if (response.ok) {
                navigate('/events');
            } else {
                setError("Failed to update event.");
            }
        } catch (err) {
            setError("An error occurred while updating the event.");
        }
    };

    return (
        <div className="dashboard-container">
            <OrganizationSidebar />
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
                            <label>Categories</label>
                            <div className="categories-bubbles">
                                {eventData.eventCategories.map(cat => (
                                    <div key={cat.categoryId} className="category-bubble">
                                        {cat.name || "Unknown category"}
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
                                        {cat.name || "Unknown category"}
                                    </option>
                                ))}
                            </select>
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
