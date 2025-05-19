import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/EventsStyles.css";
// import AdminSidebar from '../../components/AdminSidebar'; // Uncomment if you want sidebar

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    // Modal state for deletion
    const [showModal, setShowModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Message state for success/error feedback
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetch("https://localhost:7029/api/Categories")
            .then((response) => response.json())
            .then((data) => setCategories(data))
            .catch((error) => console.error("Error fetching categories:", error));
    }, []);

    const handleOpenDeleteModal = (category) => {
        setCategoryToDelete(category);
        setShowModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            const response = await fetch(
                `https://localhost:7029/api/Categories/${categoryToDelete.categoryId}`,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                setCategories((prev) =>
                    prev.filter((c) => c.categoryId !== categoryToDelete.categoryId)
                );
                setMessage({
                    type: "success",
                    text: `Category "${categoryToDelete.name}" deleted successfully.`,
                });
                setShowModal(false);
                setCategoryToDelete(null);
            } else {
                setMessage({ type: "error", text: "Failed to delete category." });
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            setMessage({ type: "error", text: "Failed to delete category." });
        }

        // Clear message after 5 seconds
        setTimeout(() => {
            setMessage(null);
        }, 5000);
    };

    const handleCreateCategory = () => navigate("/add-category");

    const handleEdit = (id) => {
        navigate(`/add-category/${id}`);
    };

    return (
        <div className="dashboard-container">
            {/* <AdminSidebar /> */}

            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-container {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          max-width: 400px;
          width: 90%;
          text-align: center;
        }
        .modal-actions button {
          margin: 5px;
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          border: none;
          border-radius: 4px;
        }
        .btn-confirm {
          background-color: red;
          color: white;
        }
        .btn-cancel {
          background-color: grey;
          color: white;
        }
        
      `}</style>

            <div className="main-content">
                <h2>Available Categories</h2>

                <div className="create-event-btn-container">
                    <button onClick={handleCreateCategory} className="create-event-btn">
                        Create New Category
                    </button>
                </div>

                {/* Message display */}
                {message && (
                    <p
                        style={{
                            color: message.text.toLowerCase().includes("success")
                                ? "green"
                                : "red",
                            marginBottom: "1rem",
                            fontWeight: "bold",
                        }}
                    >
                        {message.text}
                    </p>
                )}

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
                                    <button onClick={() => handleEdit(category.categoryId)}>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleOpenDeleteModal(category)}
                                        style={{ marginLeft: "10px", color: "red" }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Modal for confirming category deletion */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <h3>Are you sure you want to delete this category?</h3>
                            <p>
                                <strong>{categoryToDelete?.name}</strong> (ID:{" "}
                                {categoryToDelete?.categoryId})
                            </p>
                            <div className="modal-actions">
                                <button onClick={handleConfirmDelete} className="btn-confirm">
                                    Yes, Delete
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Categories;
