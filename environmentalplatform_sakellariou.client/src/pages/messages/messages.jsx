import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/MessagesStyles.css";

function Messages() {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const userId = localStorage.getItem("userId"); // Get logged-in user ID
    const [selectedParticipants, setSelectedParticipants] = useState([]);

    useEffect(() => {
        fetchConversations();
        fetchUsers();
    }, []);

    // Fetch user conversations
    const fetchConversations = async () => {
        try {
            const res = await fetch(`https://localhost:7029/api/conversation/${userId}`);
            const data = await res.json();
            setConversations(data);
        } catch (error) {
            console.error("Error fetching conversations", error);
        }
    };

    // Fetch users for new conversation modal
    const fetchUsers = async () => {
        try {
            const res = await fetch("https://localhost:7029/api/users");
            const data = await res.json();
            setUsers(data.filter(user => user.userId !== parseInt(userId)));
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const messagesEndRef = React.useRef(null);

    useEffect(() => {
        // Only scroll if messagesEndRef is in view
        /*if (messagesEndRef.current && selectedConv !== null) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        } */
    }, [messages]);

    // Fetch messages of a selected conversation
    const fetchMessages = async (convId) => {
        try {
            const res = await fetch(`https://localhost:7029/api/messages/${convId}`);
            const data = await res.json();
            setMessages(data);
            setSelectedConv(convId);

            let hasUnread = false;

            //Mark all messages as read
            for (const msg of data) {
                if (!msg.readStatuses || !msg.readStatuses.some(rs => rs.userId === parseInt(userId) && rs.isRead)) {
                    await markAsRead(msg.messageId);
                    hasUnread = true;
                }
            }        

            if (hasUnread) {
                // Refresh sidebar conversations so unread indicator disappears
                fetchConversations();
            }

        } catch (error) {
            console.error("Error fetching messages", error);
        }
    };

    const markAsRead = async (messageId) => {
        try {
            await fetch(`https://localhost:7029/api/messages/mark-as-read/${messageId}/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messageId: messageId,
                    userId: parseInt(userId)
                }),
            });
        } catch (error) {
            console.error("Error marking message as read", error);
        }
    };

    // Send new message
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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(messageData),
            });

            if (!response.ok) throw new Error("Failed to send message");

            setNewMessage(""); // Clear input field

            //Fetch updated messages after sending a message
            fetchMessages(selectedConv);

        } catch (error) {
            console.error("Error sending message:", error);
            const responseText = await error.response?.text();
            console.error("Response body:", responseText);
        }
    };

    // Open modal to create new conversation
    const openNewConversation = () => {
        setShowModal(true);
    };

    // Select users for new conversation
    const toggleUserSelection = (user) => {
        setSelectedUsers((prev) => {
            const newSelectedUsers = prev.includes(user.userId)
                ? prev.filter((id) => id !== user.userId)
                : [...prev, user.userId];
            const updatedParticipants = [...newSelectedUsers, parseInt(userId)];
            setSelectedParticipants(updatedParticipants); // Update the participants list
            return newSelectedUsers;
        });
    };

    useEffect(() => {
        setSelectedParticipants([parseInt(userId)]); // Initialize with the logged-in user
    }, [userId]);

    // Create or open existing conversation
    const createConversation = async () => {
        if (selectedParticipants.length < 2) {
            console.error("Please select at least two participants.");
            return;
        }

        try {
            const payload = { participants: selectedParticipants };

            const response = await fetch("https://localhost:7029/api/conversation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Conversation created:", data);
        } catch (error) {
            console.error("Error creating conversation", error);
        }
    };

    return (
        <>
            <div className="messenger-container">
                {/* Conversations Sidebar */}
                <div className="conversations-sidebar">
                    <button className="new-conv-btn" onClick={openNewConversation}>
                        + New Conversation
                    </button>

                    {conversations.length === 0 ? (
                        <p>No conversations</p>
                    ) : (
                        conversations.map(conv => (
                            <div key={conv.convId}
                                className={`conversation-item ${conv.hasUnreadMessages ? "unread" : ""}`}
                                onClick={() => fetchMessages(conv.convId)}>

                                {conv.participantUsernames.length > 0
                                    ? conv.participantUsernames.join(", ")
                                    : "Unnamed Conversation"}

                                {conv.hasUnreadMessages && <span className="unread-dot">🔴</span>}
                            </div>
                        ))
                    )}
                </div>

                {/* Messages View */}
                <div className="messages-panel">
                    {selectedConv ? (
                        <>
                            <div className="messages-list">
                                {messages.map(msg => (
                                    <div
                                        key={msg.messageId}
                                        className={`message ${msg.senderId === parseInt(userId) ? "my-message" : "received-message"}`}
                                    >
                                        <span className="message-text">{msg.messageContent}</span>
                                        <span className="message-time">{new Date(msg.sentAt).toLocaleTimeString()}</span>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} /> {/* auto scroll */}
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

            {/* Modal OUTSIDE of layout */}
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
