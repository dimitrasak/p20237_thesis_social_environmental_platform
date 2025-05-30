import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const UserAdmin = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    // for deleting users, add confirmation modal before deleting user and all activity related to him
    const [showModal, setShowModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [message, setMessage] = useState(null);  // to add a success/failure message to let admin know about the process of deleting a user
    const [filterStatus, setFilterStatus] = useState("all"); // all | active | inactive


    useEffect(() => {
        fetch("https://localhost:7029/api/Users")
            .then((response) => response.json())
            .then((data) => setUsers(data))
            .catch((error) => console.error("Error fetching users:", error));
    }, []);
        
    const handleOpenDeleteModal = (user) => {
        setUserToDelete(user);
        setShowModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            const response = await fetch(`https://localhost:7029/api/Users/${userToDelete.userId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setUsers((prev) => prev.filter((u) => u.userId !== userToDelete.userId));
                setMessage({ type: "success", text: `User ${userToDelete.username} deleted successfully.` });
                setShowModal(false);
                setUserToDelete(null);
            } else {
                setMessage({ type: "error", text: "Error deleting user." });
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            setMessage({ type: "error", text: "Error deleting user." });

        }
        // Clear message after 5 seconds
        setTimeout(() => {
            setMessage(null);
        }, 5000);
    };


    const handleEdit = (userId) => {
        navigate(`/edit-user/${userId}`);
    };

    const filteredUsers = users.filter((user) => {
        if (filterStatus === "active") return user.isActive === true;
        if (filterStatus === "inactive") return user.isActive === false;
        return true;
    });

    return (
        <div className="dashboard-container">
            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-container {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
          text-align: center;
        }
        .modal-actions button {
          margin: 5px;
          padding: 10px 20px;
          font-size: 16px;
        }
        .btn-confirm {
          background-color: red;
          color: white;
          border: none;
          cursor: pointer;
        }
        .btn-cancel {
          background-color: grey;
          color: white;
          border: none;
          cursor: pointer;
        }
      `}</style>
            <div className="main-content">
                <h2>Users List</h2>
                {/* Message display */}
                {message && (
                    <p
                        style={{
                            color: message.text.toLowerCase().includes("success") ? "green" : "red",
                            marginBottom: "1rem",
                            fontWeight: "bold",
                        }}
                    >
                        {message.text}
                    </p>
                )}

                {/* dropdown menu for sorting */ }
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="statusFilter">Filter by status: </label>
                    <select
                        id="statusFilter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Users</option>
                        <option value="active">Active Users</option>
                        <option value="inactive">Inactive Users</option>
                    </select>
                </div>


                <table border="1" cellPadding="10">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Role Details</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => {
                            let roleDetails = null;

                            if (user.role === "Regular User" && user.details) {
                                const { name, surname, profession, dateOfBirth } = user.details;
                                const hasAnyDetail = name || surname || profession || dateOfBirth;

                                if (hasAnyDetail) {
                                    roleDetails = (
                                        <>
                                            {name && <div>Name: {name}</div>}
                                            {surname && <div>Surname: {surname}</div>}
                                            {profession && <div>Profession: {profession}</div>}
                                            {dateOfBirth && <div>Date of Birth: {dateOfBirth}</div>}
                                        </>
                                    );
                                }
                            } else if (user.role === "Organization" && user.details) {
                                const { name, afm, website, headquarters, aim, legalForm } = user.details;
                                const hasAnyDetail = name || afm || website || headquarters || aim || legalForm;

                                if (hasAnyDetail) {
                                    roleDetails = (
                                        <>
                                            {name && <div>Name: {name}</div>}
                                            {afm && <div>AFM: {afm}</div>}
                                            {website && <div>Website: {website}</div>}
                                            {headquarters && <div>Headquarters: {headquarters}</div>}
                                            {aim && <div>Aim: {aim}</div>}
                                            {legalForm && <div>Legal Form: {legalForm}</div>}
                                        </>
                                    );
                                }
                            }

                            return (
                                <tr key={user.userId}>
                                    <td>{user.userId}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{roleDetails}</td>
                                    <td>
                                        <button onClick={() => handleEdit(user.userId)}>Edit</button>
                                        <button
                                            onClick={() => handleOpenDeleteModal(user)}
                                            style={{ marginLeft: "10px", color: "red" }}
                                        >
                                            Delete
                                        </button>

                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Modal for confirming user deletion */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <h3>Are you sure you want to delete this user?</h3>
                            <p>
                                <strong>{userToDelete?.username}</strong> (ID: {userToDelete?.userId})
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

export default UserAdmin;
