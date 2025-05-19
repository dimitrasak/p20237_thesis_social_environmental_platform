import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/FindUsersStyles.css";

function FindUsers() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const loggedInUserId = parseInt(localStorage.getItem("userId"));

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("https://localhost:7029/api/Users");
                if (!response.ok) throw new Error("Failed to fetch users");

                const data = await response.json();

                const otherUsers = data.filter(user => user.userId !== loggedInUserId);

                const sortedUsers = otherUsers.sort((a, b) => {
                    if (a.role === "Admin" && b.role !== "Admin") return -1;
                    if (a.role !== "Admin" && b.role === "Admin") return 1;
                    return 0;
                });

                setUsers(sortedUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, [loggedInUserId]);

    const handleStartConversation = async (targetUserId) => {
        try {
            // fetch all conversations for this user
            const res = await fetch(`https://localhost:7029/api/conversation/${loggedInUserId}`);
            if (!res.ok) throw new Error("Failed to load conversations");
            const allConversations = await res.json();

            // check if a conversation already exists with exactly these two users
            const existing = allConversations.find(conv => {
                const participants = conv.participantIds;
                return participants.length === 2 &&
                    participants.includes(loggedInUserId) &&
                    participants.includes(targetUserId);
            });

            if (existing) {
                navigate(`/messages/${existing.convId}`);
                return;
            }

            // No conversation found, create one
            const payload = { participants: [loggedInUserId, targetUserId] };
            const response = await fetch("https://localhost:7029/api/conversation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to create conversation");
            const data = await response.json();

            navigate(`/messages/${data.conversationId}`);
        } catch (err) {
            console.error(err);
            alert("Could not start conversation");
        }
    };

    return (
        <div className="find-people-container">
            <h2>Find People</h2>
            <div className="user-grid">
                {users.map(user => (
                    <div
                        key={user.userId}
                        className="user-card"
                        onClick={() => navigate(`/profile/${user.userId}`)}
                    >
                        <img
                            src={`https://localhost:7029/images/${user.profilePic || "default-profile.jpg"}`}
                            alt={user.username}
                            className="user-avatar"
                        />
                        <h4>{user.username}</h4>
                        <p>{user.role}</p>
                        <button
                            className="message-btn"
                            onClick={(e) => {
                                e.stopPropagation(); // prevent card click
                                handleStartConversation(user.userId);
                            }}
                        >
                            Message
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FindUsers;
