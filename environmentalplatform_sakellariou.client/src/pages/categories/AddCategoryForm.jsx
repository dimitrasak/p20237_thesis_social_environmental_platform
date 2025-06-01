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
            ? { categoryId: parseInt(id, 10), name, description }
            : { name, description };

        const url = id
            ? `https://localhost:7029/api/Categories/${id}`
            : "https://localhost:7029/api/Categories";

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
            {/* <AdminSidebar /> */}
            <div className="main-content">
                <h2 className="main-title">{id ? "Edit Category" : "Add Category"}</h2>
                <div className="event-form-container">
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <form className="event-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Category Name</label>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field"
                                placeholder="Enter category name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="input-field"
                                rows="4"
                                placeholder="Enter category description"
                            ></textarea>
                        </div>

                        <button type="submit" className="submit-button">
                            {id ? "Save Changes" : "Create New Category"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCategoryForm;
