import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizationSidebar from '../../components/OrganizationSidebar';
import '../../styles/OrganizationDashboard.css'; 

function Settings({ userEmail }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isActive, setIsActive] = useState(true); 
    const [userRole, setUserRole] = useState(null); 

    // for confirmation before deletion/deactivation
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null); // "deactivate" | "delete"

    const navigate = useNavigate();

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(parseInt(storedUserId));
            fetchUserStatus(parseInt(storedUserId));
        } else {
            navigate("/login"); // redirect if not logged in
        }
    }, []);

    const fetchUserStatus = async (id) => {
        try {
            const res = await fetch(`https://localhost:7029/api/Users/${id}`);
            if (!res.ok) throw new Error("Failed to fetch user data");
            const user = await res.json();
            setIsActive(user.isActive);
            setUserRole(user.role);
        } catch (error) {
            console.error("Error fetching user status:", error);
            setMessage({ type: "error", text: "Failed to load user data." });
        }
    };

    const confirmDeactivate = () => {
        setModalAction("deactivate");
        setShowModal(true);
    };

    const confirmDelete = () => {
        setModalAction("delete");
        setShowModal(true);
    };


    const handleDeleteAccount = async () => {
        if (!userId) return;

        try {
            const response = await fetch(`https://localhost:7029/api/Users/${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                localStorage.clear(); 
                window.dispatchEvent(new Event('storage'));
                navigate("/register"); 
            } else {
                const error = await response.json();
                alert("Failed to delete account: " + error.message);
            }
        } catch (err) {
            console.error("Error deleting account:", err);
            alert("Something went wrong. Try again later.");
        }
    };

    const handlePasswordChange = async () => {
        if (!userId || !currentPassword || !newPassword) {
            setMessage({ type: "error", text: "Please fill in both fields." });
            return;
        }

        try {
            const res = await fetch(`https://localhost:7029/api/Users/change-password/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const result = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: "Password changed successfully!" });
                setCurrentPassword("");
                setNewPassword("");
            } else {
                setMessage({ type: "error", text: result.message || "Failed to change password." });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "An error occurred while changing the password." });
        }
    };



    const handleDeactivate = async () => {
        if (!userId) {
            setMessage({ type: "error", text: "User ID not found." });
            return;
        }

        try {
            const res = await fetch(`https://localhost:7029/api/Users/deactivate/${userId}`, {
                method: "POST",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setMessage({ type: "success", text: data.message });
            setIsActive(false);
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            console.error("Error deactivating account:", err);
            setMessage({ type: "error", text: err.message || "Failed to deactivate account." });
        }
    };

    const handleReactivate = async () => {
        if (!userId) {
            setMessage({ type: "error", text: "User ID not found." });
            return;
        }

        try {
            const res = await fetch(`https://localhost:7029/api/Users/reactivate/${userId}`, {
                method: "POST",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setMessage({ type: "success", text: data.message });
            setIsActive(true);
            setTimeout(() => window.location.reload(), 1000); 
        } catch (err) {
            console.error("Error reactivating account:", err);
            setMessage({ type: "error", text: err.message || "Failed to reactivate account." });
        }
    };

    const handleModalConfirm = () => {
        setShowModal(false);
        if (modalAction === "delete") {
            handleDeleteAccount();
        } else if (modalAction === "deactivate") {
            handleDeactivate();
        }
    };

    
    return (
        <div className="dashboard-container">
            {/* Main Content */}
            <div className="main-content">
                <h2 className="main-title">Account Settings</h2>

                {message && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="settings-section">
                    <h3>Change Password</h3>
                    <input
                        type="password"
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                        onClick={handlePasswordChange}
                        disabled={!currentPassword || !newPassword}
                    >
                        Change Password
                    </button>
                </div>

                {/* Only show deactivate/delete if not Admin */}
                {userRole !== 'Admin' && isActive && (
                    <>
                        <div className="settings-section">
                            <h3>Deactivate Account</h3>
                            <p>This will temporarily disable your account.</p>
                            <button onClick={confirmDeactivate}>Deactivate</button>
                        </div>

                        <div className="settings-section">
                            <h3>Delete Account</h3>
                            <p style={{ color: "red" }}>
                                This action is irreversible. It will permanently delete your account and all data.
                            </p>
                            <button
                                style={{ backgroundColor: "red", color: "white" }}
                                onClick={confirmDelete}
                            >
                                Delete My Account
                            </button>
                        </div>
                    </>
                )}

                {/* Reactivate option for inactive users */}
                {userRole !== 'Admin' && !isActive && (
                    <div className="settings-section">
                        <h3>Your account is deactivated</h3>
                        <p>You can reactivate your account to regain access.</p>
                        <button onClick={handleReactivate}>Reactivate Account</button>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <h3>
                            {modalAction === "deactivate"
                                ? "Are you sure you want to deactivate your account?"
                                : "Are you sure you want to delete your account?"}
                        </h3>
                        <p>
                            {modalAction === "delete" && (
                                <strong>User ID: {userId}</strong>
                            )}
                        </p>
                        <div className="modal-actions">
                            <button onClick={handleModalConfirm} className="btn-confirm">
                                Yes, {modalAction === "delete" ? "Delete" : "Deactivate"}
                            </button>
                            <button onClick={() => setShowModal(false)} className="btn-cancel">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <style>{`
                .settings-section {
                    margin-bottom: 30px;
                }

                .settings-section input {
                    display: block;
                    width: 100%;
                    margin: 10px 0;
                    padding: 8px;
                    font-size: 14px;
                }

                .settings-section button {
                    padding: 10px 20px;
                    font-size: 14px;
                    cursor: pointer;
                    border: none;
                    background-color: #007bff;
                    color: white;
                    border-radius: 4px;
                    margin-top: 10px;
                }

                .settings-section button:hover {
                    background-color: #0056b3;
                }

                .message {
                    font-weight: bold;
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 5px;
                }

                .message.success {
                    color: green;
                    background-color: #e6ffec;
                }

                .message.error {
                    color: red;
                    background-color: #ffe6e6;
                }

                .settings-section button:disabled {
                    background-color: #cccccc;
                    cursor: not-allowed;
                }

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
        </div>
    );
}

export default Settings;
