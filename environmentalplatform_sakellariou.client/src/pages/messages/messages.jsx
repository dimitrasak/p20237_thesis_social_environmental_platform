import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../../styles/MessagesStyles.css";

function Messages() {
    const navigate = useNavigate();
    const { conversationId } = useParams(); // get conv ID from route
    const userId = localStorage.getItem("userId");

    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (conversationId) {
            fetchMessages(parseInt(conversationId));
        }
    }, [conversationId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await fetch(`https://localhost:7029/api/conversation/${userId}`);
            const data = await res.json();
            setConversations(data);
        } catch (error) {
            console.error("Error fetching conversations", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("https://localhost:7029/api/users");
            const data = await res.json();
            setUsers(data.filter(user => user.userId !== parseInt(userId)));
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const fetchMessages = async (convId) => {
        try {
            const res = await fetch(`https://localhost:7029/api/messages/${convId}`);
            const data = await res.json();
            setMessages(data);
            setSelectedConv(convId);

            let hasUnread = false;
            for (const msg of data) {
                if (!msg.readStatuses?.some(rs => rs.userId === parseInt(userId) && rs.isRead)) {
                    await markAsRead(msg.messageId);
                    hasUnread = true;
                }
            }

            if (hasUnread) fetchConversations();
        } catch (error) {
            console.error("Error fetching messages", error);
        }
    };

    const markAsRead = async (messageId) => {
        try {
            await fetch(`https://localhost:7029/api/messages/mark-as-read/${messageId}/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId, userId: parseInt(userId) }),
            });
        } catch (error) {
            console.error("Error marking message as read", error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            convId: selectedConv,
            senderId: parseInt(userId),
            messageContent: newMessage,
        };

        try {
            const response = await fetch("https://localhost:7029/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(messageData),
            });

            if (!response.ok) throw new Error("Failed to send message");

            setNewMessage("");
            fetchMessages(selectedConv);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const openNewConversation = () => {
        setShowModal(true);
    };

    const toggleUserSelection = (user) => {
        setSelectedUsers((prev) => {
            const newSelectedUsers = prev.includes(user.userId)
                ? prev.filter((id) => id !== user.userId)
                : [...prev, user.userId];
            setSelectedParticipants([...newSelectedUsers, parseInt(userId)]);
            return newSelectedUsers;
        });
    };

    useEffect(() => {
        setSelectedParticipants([parseInt(userId)]);
    }, [userId]);

    const createConversation = async () => {
        if (selectedParticipants.length < 2) {
            console.error("Please select at least two participants.");
            return;
        }

        try {
            // Check if a conversation already exists
            const res = await fetch(`https://localhost:7029/api/conversation/${userId}`);
            const allConvs = await res.json();
            const selectedSet = new Set(selectedParticipants);

            const existingConv = allConvs.find(conv => {
                const convSet = new Set(conv.participantIds);
                return selectedSet.size === convSet.size && [...selectedSet].every(id => convSet.has(id));
            });

            if (existingConv) {
                setShowModal(false);
                navigate(`/messages/${existingConv.convId}`);
                return;
            }

            // Create new conversation
            const payload = { participants: selectedParticipants };
            const response = await fetch("https://localhost:7029/api/conversation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            setShowModal(false);
            navigate(`/messages/${data.conversationId}`);
        } catch (error) {
            console.error("Error creating or opening conversation", error);
        }
    };

    const getProfilePicByUsername = (username) => {
        const user = users.find(u => u.username === username);
        return user?.profilePictureUrl || "default-profile.jpg"; // fallback
    };


    return (
        <>
            <div className="messenger-container">
                <div className="conversations-sidebar">
                    <button className="new-conv-btn" onClick={openNewConversation}>+ New Conversation</button>
                    {conversations.length === 0 ? (
                        <p>No conversations</p>
                    ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv.convId}
                                    className={`conversation-item ${conv.hasUnreadMessages ? "unread" : ""}`}
                                    onClick={() => navigate(`/messages/${conv.convId}`)}
                                >
                                    <div className="conversation-user-list">
                                        {conv.participantIds.length === 1 ? (
                                            // Only one participant means the other is deleted
                                            <span>Deleted/Deactivated Account</span>
                                        ) : conv.participantUsernames.length === 1 ? (
                                            // Two-person convo (currently logged in user + 1 other)
                                            <div className="conversation-user">
                                                <img
                                                    src={`https://localhost:7029/images/prof_pics/${conv.participantProfilePictures?.[0] || "default-profile.jpg"
                                                        }`}
                                                    alt="avatar"
                                                    className="sidebar-avatar"
                                                />
                                                <span>
                                                    {conv.participantUsernames[0] === "Deactivated account" //αν το string που επιστρεφεται ειναι Deactivated account, στο ui εμφανιζεται το αποκατω μηνυμα
                                                        ? "Deactivated Account"
                                                        : conv.participantUsernames[0]}
                                                </span>
                                            </div>
                                        ) : (
                                            // Group conversation, more than 2 participants
                                            <span>
                                                {conv.participantUsernames
                                                    .map(name =>
                                                        name === "Deactivated account"
                                                            ? "Deleted/Deactivated Account"
                                                            : name
                                                    )
                                                    .join(", ")}
                                            </span>
                                        )}

                                        {conv.hasUnreadMessages && <span className="unread-dot">🔴</span>}
                                    </div>
                                </div>
                            ))

                    )}
                </div>

                <div className="messages-panel">
                    {selectedConv ? (
                        <>
                            <div className="messages-list">
                                {messages.map(msg => {
                                    const isMyMessage = msg.senderId === parseInt(userId);
                                    return (
                                        <div
                                            key={msg.messageId}
                                            className={`message-row ${isMyMessage ? "my-row" : "received-row"}`}
                                        >
                                            {/* Show avatar only for received messages */}
                                            {!isMyMessage && (
                                                <img
                                                    src={`https://localhost:7029/images/prof_pics/${msg.senderProfilePic || "default-profile.jpg"}`}
                                                    alt="profile"
                                                    className="message-avatar"
                                                />

                                            )}
                                            <div className={`message ${isMyMessage ? "my-message" : "received-message"}`}>
                                                <span className="message-text">{msg.messageContent}</span>
                                                <span className="message-time">{new Date(msg.sentAt).toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="message-input">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                />
                                <button onClick={sendMessage} disabled={!newMessage.trim()}>Send</button>
                            </div>
                        </>
                    ) : (
                        <p>Select a conversation</p>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <h3>Select Participants</h3>
                        <div className="users-list">
                            {users.map(user => (
                                <div
                                    key={user.userId}
                                    className={`user-item ${selectedUsers.includes(user.userId) ? "selected" : ""}`}
                                    onClick={() => toggleUserSelection(user)}
                                >
                                    {user.username}
                                </div>
                            ))}
                        </div>
                        <button className="create-btn" onClick={createConversation}>Create Conversation</button>
                        <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Messages;
