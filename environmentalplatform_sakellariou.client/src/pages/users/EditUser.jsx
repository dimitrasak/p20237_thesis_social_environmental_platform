import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/EditProfile.css"; 

const EditUser = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch(`https://localhost:7029/api/Users/${userId}`)
            .then((res) => res.json())
            .then((data) => setUser(data))
            .catch((err) => console.error("Error fetching user:", err));
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("details.")) {
            const detailKey = name.split(".")[1];
            setUser((prev) => ({
                ...prev,
                details: {
                    ...prev.details,
                    [detailKey]: value,
                },
            }));
        } else {
            setUser((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`https://localhost:7029/api/Users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
            });

            if (res.ok) {
                setMessage("User updated successfully ✅");
                setTimeout(() => {
                    navigate("/admin-users");
                }, 5000);
            } else {
                setMessage("Update failed ❌");
            }
        } catch (err) {
            console.error("Update error:", err);
            setMessage("An error occurred ❌");
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="edit-profile-page">
            <div className="edit-profile-left">
                <img
                    src={`https://localhost:7029/images/prof_pics/${user.profilePic || "default-profile.jpg"}`}
                    alt="User"
                />
                <h2>{user.username}</h2>
            </div>

            <div className="edit-profile-right">
                <h2>Edit User</h2>

                {message && (
                    <p style={{ color: message.includes("successfully") ? "green" : "red", marginBottom: "1rem" }}>
                        {message}
                    </p>
                )}

                <div className="user-role-badge">
                    <span className={`role ${user.role.replace(/\s/g, "-").toLowerCase()}`}>
                        {user.role}
                    </span>
                </div>


                <form onSubmit={handleSubmit}>
                    <label>Username:</label>
                    <input name="username" value={user.username || ""} onChange={handleChange} />

                    <label>Email:</label>
                    <input name="email" value={user.email || ""} onChange={handleChange} />

                    {user.role === "Regular User" && user.details && (
                        <>
                            <label>Name:</label>
                            <input name="details.name" value={user.details.name || ""} onChange={handleChange} />

                            <label>Surname:</label>
                            <input name="details.surname" value={user.details.surname || ""} onChange={handleChange} />

                            <label>Profession:</label>
                            <input name="details.profession" value={user.details.profession || ""} onChange={handleChange} />

                            <label>Date of Birth:</label>
                            <input type="date" name="details.dateOfBirth" value={user.details.dateOfBirth || ""} onChange={handleChange} />
                        </>
                    )}

                    {user.role === "Organization" && user.details && (
                        <>
                            <label>Name:</label>
                            <input name="details.name" value={user.details.name || ""} onChange={handleChange} />

                            <label>AFM:</label>
                            <input name="details.afm" value={user.details.afm || ""} onChange={handleChange} />

                            <label>Website:</label>
                            <input name="details.website" value={user.details.website || ""} onChange={handleChange} />

                            <label>Headquarters:</label>
                            <input name="details.headquarters" value={user.details.headquarters || ""} onChange={handleChange} />

                            <label>Aim:</label>
                            <input name="details.aim" value={user.details.aim || ""} onChange={handleChange} />

                            <label>Legal Form:</label>
                            <input name="details.legalForm" value={user.details.legalForm || ""} onChange={handleChange} />
                        </>
                    )}

                    <button type="submit">Save</button>
                </form>
            </div>
        </div>
    );
};

export default EditUser;
