import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const UserAdmin = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("https://localhost:7029/api/Users")
            .then((response) => response.json())
            .then((data) => setUsers(data))
            .catch((error) => console.error("Error fetching users:", error));
    }, []);

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            const response = await fetch(`https://localhost:7029/api/Users/${userId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setUsers(users.filter((user) => user.userId !== userId));
            } else {
                alert("Failed to delete user.");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const handleEdit = (userId) => {
        navigate(`/edit-user/${userId}`);
    };

    return (
        <div className="dashboard-container">
            <div className="main-content">
                <h2>Users List</h2>
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
                        {users.map((user) => {
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
                                            onClick={() => handleDelete(user.userId)}
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
            </div>
        </div>
    );
};

export default UserAdmin;
