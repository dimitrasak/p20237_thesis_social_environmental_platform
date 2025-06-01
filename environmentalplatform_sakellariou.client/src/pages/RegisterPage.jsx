import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  // assuming you're using react-router
import "../styles/Forms.css";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: ""
    });

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const userData = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role
        };

        try {
            const response = await fetch("https://localhost:7029/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Registration failed");
            }

            const data = await response.json();
            // Instead of alert, show modal
            setModalMessage(data.message || "Registration successful!");
            setShowModal(true);
        } catch (error) {
            console.error("Registration error:", error);
            alert("Registration failed: " + error.message);
        }
    };

    const handleModalOk = () => {
        setShowModal(false);
        navigate("/login");  // redirect to login page
    };

    return (
        <div className="form-container">
            <h2>Register</h2>

            <form onSubmit={handleSubmit}>
                <label>Username:</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required />

                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />

                <label>Password:</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />

                <label>Role:</label>
                <select name="role" value={formData.role} onChange={handleChange} required>
                    <option value="">Select Role</option>
                    <option value="Regular User">Regular User</option>
                    <option value="Organization">Organization</option>
                </select>

                <button type="submit">Register</button>
            </form>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p>{modalMessage}</p>
                        <button onClick={handleModalOk}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterPage;
