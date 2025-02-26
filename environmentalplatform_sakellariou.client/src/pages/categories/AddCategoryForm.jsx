import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import "../../styles/EventsStyles.css";

const AddCategoryForm = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams(); // Get category ID from URL

    // Fetch category data when editing
    useEffect(() => {
        if (id) {
            fetch(`https://localhost:7029/api/Categories/${id}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Category with ID ${id} not found`);
                    }
                    return response.json();
                })
                .then((data) => {
                    setName(data.name);
                    setDescription(data.description);
                })
                .catch((error) => {
                    console.error("Error fetching category:", error);
                    setError("Category not found or API error.");
                });
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const categoryData = id
            ? { categoryId: parseInt(id, 10), name, description }  // Include ID when updating
            : { name, description }; // No ID when creating

        const url = id
            ? `https://localhost:7029/api/Categories/${id}` // PUT for updating
            : "https://localhost:7029/api/Categories"; // POST for creating

        const method = id ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(categoryData),
            });

            if (response.ok) {
                setSuccess(id ? "Category updated successfully!" : "Category added successfully!");
                setTimeout(() => navigate('/categories'), 1500);
            } else {
                setError("Failed to save category.");
            }
        } catch (error) {
            console.error("Error saving category:", error);
            setError("An error occurred while saving the category.");
        }
    };


    return (
        <div className="dashboard-container">
            <AdminSidebar />

            <div className="main-content">
                <h2 className="main-title">{id ? "Edit Category" : "Add Category"}</h2>
                <form className="event-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="category-name">Category Name</label>
                        <input
                            type="text"
                            id="category-name"
                            placeholder="Category Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category-description">Description</label>
                        <textarea
                            id="category-description"
                            placeholder="Description"
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <button type="submit">{id ? "Save Changes" : "Create New Category"}</button>
                </form>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
            </div>
        </div>
    );
};

export default AddCategoryForm;
