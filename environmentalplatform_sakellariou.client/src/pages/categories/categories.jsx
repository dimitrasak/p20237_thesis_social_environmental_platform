import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../../styles/EventsStyles.css";
import AdminSidebar from '../../components/AdminSidebar';


const Categories = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("https://localhost:7029/api/Categories")
            .then((response) => response.json())
            .then((data) => setCategories(data))
            .catch((error) => console.error("Error fetching categories:", error));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        try {
            const response = await fetch(`https://localhost:7029/api/Categories/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setCategories(categories.filter((category) => category.categoryId !== id));
            } else {
                alert("Failed to delete category.");
            }
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    const handleCreateCategory= () => navigate('/add-category');

    const handleEdit = (id) => {
        console.log("Editing category with ID:", id); 
        navigate(`/add-category/${id}`);
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="main-content">
                <h2>Available Categories</h2>
                <div className="create-event-btn-container">
                    <button
                        onClick={handleCreateCategory}
                        className="create-event-btn"
                    >
                        Create New Category
                    </button>
                </div>
            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category) => (
                        <tr key={category.categoryId}>
                            <td>{category.categoryId}</td>
                            <td>{category.name}</td>
                            <td>{category.description}</td>
                            <td>
                                <button onClick={() => handleEdit(category.categoryId)}>Edit</button>
                                <button onClick={() => handleDelete(category.categoryId)} style={{ marginLeft: "10px", color: "red" }}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
    );
};

export default Categories;
