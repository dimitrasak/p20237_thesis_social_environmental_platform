import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../../styles/EventsStyles.css";
import OrganizationSidebar from '../../components/OrganizationSidebar';
import RegUserSidebar from '../../components/RegUserSidebar';
import { Edit2, Trash2, Flag } from "lucide-react";



function EventDetails() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [profilePic, setProfilePic] = useState("default-profile.jpg");
    //const [userId, setUserId] = useState(null); 
    //const userId = localStorage.getItem("userId");

    const [user, setUser] = useState({ username: "", profilePic: "" });
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [comments, setComments] = useState({}); // To store comments for each post
    const [newComments, setNewComments] = useState({});
    const [selectedCommentId, setSelectedCommentId] = useState(null);

    //for deleting a comment
    const [showModal, setShowModal] = useState(false); // For showing/hiding the modal
    const [commentToDelete, setCommentToDelete] = useState(null); // The comment to be deleted
    const [postIdToDelete, setPostIdToDelete] = useState(null); // State for the postId

    //for editing a comment
    const [editCommentData, setEditCommentData] = React.useState(null);
    // editCommentData = { comment, postId }
    const [editCommentText, setEditCommentText] = React.useState("");

    // reg user show interest
    const [interest, setInterest] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    //for reports three dot menu, and opening modal to choose the reason for reporting a post/comment
    const [selectedReportTarget, setSelectedReportTarget] = useState({ type: null, id: null });
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportMenuTargetId, setReportMenuTargetId] = useState(null); // to track which menu is open
    const [reportSubmitted, setReportSubmitted] = useState(false);


    //fetch Posts => outside useEffect in order to update post list after creating a new post
    const fetchPosts = async () => {
        try {
            const response = await fetch(`https://localhost:7029/api/posts/event/${eventId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch posts");
            }
            const data = await response.json();
            /*console.log("Fetched Posts:", data); // Debugging */ 
            setPosts(data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };
  
    const fetchComments = async (postId) => {
        try {
            const response = await fetch(`https://localhost:7029/api/comments/post/${postId}?limit=4`);
            if (!response.ok) throw new Error("Failed to fetch comments");

            const data = await response.json();

            const sorted = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            const hasMore = sorted.length > 3;
            const displayed = hasMore ? sorted.slice(0, 3) : sorted;

            setComments(prevComments => ({
                ...prevComments,
                [postId]: {
                    displayed,
                    full: null,
                    hasMore
                }
            }));
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };


    const handleLoadFullComments = async (postId) => {
        try {
            const response = await fetch(`https://localhost:7029/api/comments/post/${postId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch full comments");
            }
            const data = await response.json();

            const sorted = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            setComments(prevComments => ({
                ...prevComments,
                [postId]: {
                    ...prevComments[postId],
                    displayed: sorted,
                    full: sorted,
                    hasMore: false,
                }
            }));
        } catch (error) {
            console.error("Error loading full comments:", error);
        }
    };




    useEffect(() => {
        //user data from local storage
        const storedRole = localStorage.getItem("userRole");
        const storedUsername = localStorage.getItem("username");
        const storedProfilePic = localStorage.getItem("profilePic") || "default-profile.jpg";

        setUserRole(storedRole);
        setUser({ username: storedUsername, profilePic: storedProfilePic });
        setProfilePic(storedProfilePic);

        //fetch event details
        const fetchEvent = async () => {
            try {
                const response = await fetch(`https://localhost:7029/api/events/${eventId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch event details.");
                }
                const data = await response.json();
                /*console.log("Fetched event data: ", data); */ 
                setEvent(data);
            } catch (error) {
                console.error("Error fetching event:", error);
                setError(error.message);
            }
        };

        fetchEvent(); // fetch event data
    }, [eventId]);  //runs whenever eventId changes

    useEffect(() => {
        if (event) {
            fetchPosts(); // Only fetch posts once event is loaded
        }
    }, [event]); //runs whenever event is fetched

    // Call fetchComments for each post
    useEffect(() => {
        posts.forEach(post => {
            fetchComments(post.postId);
        });
    }, [posts]);

    /* console loging for debugging */
    /*useEffect(() => {
        console.log("Event Image effect method URL:", event?.imageUrl); // Only logs if event is loaded
    }, [event]); */

    const handleCategoryClick = (categoryId) => {
        // Navigate to the events page with the category filter
        navigate(`/events?category=${categoryId}`);
    };

    //handle post submission
    const handlePostSubmit = async () => {
        if (!newPost.trim()) {
            alert("Post content cannot be empty!");
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await fetch("https://localhost:7029/api/posts/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    eventId: eventId,
                    postContent: newPost,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create post");
            }

            setNewPost("");
            setIsModalOpen(false);

            //fetch updated posts after creating a new one
            fetchPosts();
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    //handle comment addition
    const handleCommentSubmit = async (postId) => {
        const commentContent = newComments[postId];

        if (!commentContent.trim()) {
            alert("Comment content cannot be empty!");
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await fetch("https://localhost:7029/api/comments/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    postId: postId,
                    commentContent: commentContent,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create comment");
            }

            setNewComments((prevState) => ({
                ...prevState,
                [postId]: "", // Clear the comment input for the specific post after submission
            }));

            // Fetch updated comments for the post
            fetchComments(postId);
        } catch (error) {
            console.error("Error creating comment:", error);
        }
    };

    const handleCommentChange = (postId, value) => {
        setNewComments((prevState) => ({
            ...prevState,
            [postId]: value, // Store the comment content for the specific postId
        }));
    };

    const openCommentMenu = (commentId) => {
        setSelectedCommentId((prev) => (prev === commentId ? null : commentId)); // Toggle menu
    };

    const handleConfirmDelete = async () => {
        if (!commentToDelete || !commentToDelete.commentId || !postIdToDelete || postIdToDelete === 0) {
            console.error("No comment or postId selected for deletion.");
            return;
        }

        console.log("Deleting comment:", commentToDelete);

        try {
            const response = await fetch(`https://localhost:7029/api/comments/delete/${commentToDelete.commentId}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.ok) {
                // Update the UI immediately without needing to refetch
                setComments((prevComments) => {
                    const updatedComments = { ...prevComments };

                    if (!updatedComments[postIdToDelete]) {
                        return prevComments; // No comments to update
                    }

                    const postComments = updatedComments[postIdToDelete];

                    updatedComments[postIdToDelete] = {
                        ...postComments,
                        displayed: postComments.displayed?.filter(
                            (comment) => comment.commentId !== commentToDelete.commentId
                        ),
                        full: postComments.full?.filter(
                            (comment) => comment.commentId !== commentToDelete.commentId
                        ),
                        hasMore: (postComments.full?.length || postComments.displayed.length) > 3
                    };

                    return updatedComments;
                });

                setShowModal(false);

                // Optional: If you still want to refetch fresh comments from backend
                // await fetchComments(postIdToDelete);
            } else {
                console.error('Failed to delete comment');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };




    const handleOpenDeleteModal = (comment, postId) => {
        //console.log("Selected comment for deletion:", comment);
        //console.log("selected postId", postId)
        setCommentToDelete(comment); // Set the comment to be deleted
        setPostIdToDelete(postId); // Set the postId to be used later in fetchComments
        setShowModal(true); // Show the modal for confirmation
    };

    const handleEditComment = (comment, postId) => {
        setEditCommentData({ comment, postId });
        setEditCommentText(comment.commentContent);
    };


    // for show interest button
    // Fetch user's existing interest when component loads
    useEffect(() => {
        // Fetch user interest when the event page loads
        const fetchUserInterest = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                console.error("User ID not found in localStorage");
                return;
            }

            try {
                const response = await fetch(`https://localhost:7029/api/user-interests/${userId}/${eventId}`);
                if (response.status === 404) {
                    console.log("User has not chosen an interest yet.");
                    setInterest(null); // Set interest to null if the user hasn't selected anything yet
                    return; // No need to throw an error, handle it gracefully
                }
                if (!response.ok) {
                    throw new Error("Failed to fetch user interest");
                }
                const data = await response.json();
                setInterest(data.interestType); // Set user's existing interest
            } catch (error) {
                console.error("Error fetching user interest:", error);
            }
        };

        fetchUserInterest();
    }, [eventId]);


    // Function to handle interest selection
    const handleInterestSelect = async (selectedInterest) => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId) {
            console.error("User ID not found in localStorage");
            return;
        }

        const payload = {
            userId: parseInt(userId),
            eventId: parseInt(eventId),
            interestType: selectedInterest
        };

        console.log("Sending interest payload:", payload);

        try {
            const response = await fetch("https://localhost:7029/api/user-interests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error response:", errorData);
                return;
            }

            console.log("Interest saved successfully");
            setInterest(selectedInterest); // Update the interest state
            setShowDropdown(false); // Close dropdown after selection
        } catch (error) {
            console.error("Error saving interest:", error);
        }
    };

    //handle reports
    const handleReport = async (reason) => {
        const userId = parseInt(localStorage.getItem("userId"));
        const report = {
            userId,
            reason,
            status: "Pending",
            createdAt: new Date().toISOString(),
            postId: selectedReportTarget.type === "post" ? selectedReportTarget.id : null,
            commentId: selectedReportTarget.type === "comment" ? selectedReportTarget.id : null,
        };

        try {
            const response = await fetch("https://localhost:7029/api/Reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(report),
            });

            if (response.ok) {
                setReportSubmitted(true); //trigger modal message change
            } else {
                alert("Failed to submit report.");
            }
        } catch (err) {
            console.error(err);
            alert("Error submitting report.");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close the dropdown if clicking outside the post-actions area
            if (
                !event.target.closest(".post-actions") &&
                reportMenuTargetId !== null
            ) {
                setReportMenuTargetId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [reportMenuTargetId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                !event.target.closest(".comment-actions") &&
                selectedCommentId !== null
            ) {
                setSelectedCommentId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectedCommentId]);




    return (
        <div style={{ display: "flex", height: "100vh", marginTop: "-10px" }}>
            {/* Sidebar */}
            {/* {userRole === "Organization" ? <OrganizationSidebar /> : <RegUserSidebar />} */}

            {/* Main Content */}
            <div className="main-content">
                {error ? (
                    <p className="error-message">{error}</p>
                ) : event ? (
                    <>
                            {/* for debugging */}
                            {/* {console.log("Event Image URL:", event.imageUrl)} */}

                        <div className="event-cover">
                               
                                <img
                                    src={`https://localhost:7029${event.imageUrl ? event.imageUrl.replace(/\\/g, '/') : ''}`}
                                    alt={event.title}
                                    loading="lazy"
                                />
                                
                            </div>

                            <div className="event-header">
                                {/* Event Title */}
                                <div className="event-title-container">
                                    <h1 className="event-title">{event.title}</h1>
                                </div>

                                {/* Interest Dropdown for Regular Users */}
                                {userRole === "Regular User" && (
                                    <div className="interest-dropdown">
                                        <button onClick={() => setShowDropdown(!showDropdown)}>
                                            {interest || "Show Interest"}
                                        </button>
                                        {showDropdown && (
                                            <div className="dropdown-menu">
                                                <button onClick={() => handleInterestSelect("I'll go")}>I'll go</button>
                                                <button onClick={() => handleInterestSelect("I'm interested")}>I'm interested</button>
                                                <button onClick={() => handleInterestSelect("I'm not interested")}>I'm not interested</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                        </div>

                        {/* Event Info Card */}
                        <div className="event-info-card">
                            <h3>Event Details</h3>
                            <p><strong>📍 Location:</strong> {event.location}</p>
                                <p><strong>📅 Date & Time:</strong> {new Date(event.date).toLocaleString('en-GB', {
                                    weekday: 'long',    // Full day of the week (e.g., Monday)
                                    year: 'numeric',    // Full year
                                    month: 'long',      // Full month name (e.g., February)
                                    day: 'numeric',     // Numeric day (e.g., 15)
                                    hour: '2-digit',    // Two digits for hour
                                    minute: '2-digit',  // Two digits for minute
                                    hour12: false       // Use 24-hour format
                                })}</p>
                            <p><strong>📖 Description:</strong> {event.description}</p>
                            <p><strong>✅ Requirements:</strong> {event.requirements}</p>
                            <p><strong>Categories:</strong> </p>
                            {/* Categories Bubbles */}
                            <div className="categories-bubbles">
                                {event.eventCategories.map(category => (
                                    <span
                                        key={category.categoryId}
                                        className="category-bubble"
                                        onClick={() => handleCategoryClick(category.categoryId)}
                                    >
                                        {category.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                            {/* Post Preview (Card) */}
                            <div className="post-preview">
                                <img src={`https://localhost:7029/images/prof_pics/${profilePic}`} alt="Profile" className="profile-pic" />
                                <input
                                    type="text"
                                    placeholder="Write something..."
                                    className="post-input"
                                    onClick={() => setIsModalOpen(true)}
                                />
                            </div>

                            {/* Post Modal */}
                            {isModalOpen && (
                                <div className="modal-overlay">
                                    <div className="modal-container">
                                        <h3>Create a Post</h3>
                                        <textarea
                                            className="modal-textarea"
                                            placeholder="Share something about this event..."
                                            value={newPost}
                                            onChange={(e) => setNewPost(e.target.value)}
                                        />
                                        <div className="modal-actions">
                                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                            <button className="post-btn" onClick={handlePostSubmit}>Post</button>
                                        </div>
                                    </div>
                                </div>
                            )}



                            {/* Posts List */}
                            <div className="posts-list">
                                {posts.length > 0 ? (
                                    posts.map((post) => (
                                        <div key={post.postId} className="post-card">
                                            {/* Post Header */}
                                            <div className="post-header-container">
                                                <div className="post-header">
                                                    <img
                                                        src={`https://localhost:7029/images/prof_pics/${profilePic}`}
                                                        alt="User"
                                                        className="profile-pic"
                                                    />
                                                    <div>
                                                        <h4>{post.user?.username || "Unknown User"}</h4>
                                                        <p className="post-time">
                                                            {new Date(post.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                {(() => {
                                                    const postOwnerId = Number(post.user?.userId);
                                                    const currentUserId = Number(localStorage.getItem("userId"));
                                                    //console.log(`Post Owner: ${postOwnerId}, Logged-in User: ${currentUserId}`);
                                                    return postOwnerId !== currentUserId;
                                                })() && (  // three dot button appears in posts only if postOwneriD !== currentUserId (currently logged in user)
                                                        <div className="post-actions">
                                                            <button
                                                                onClick={() =>
                                                                    setReportMenuTargetId(
                                                                        reportMenuTargetId === post.postId ? null : post.postId
                                                                    )
                                                                }
                                                            >
                                                                ⋮
                                                            </button>

                                                            {reportMenuTargetId === post.postId && (
                                                                <div className="dropdown-menu">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedReportTarget({ type: "post", id: post.postId });
                                                                            setShowReportModal(true);
                                                                            setReportMenuTargetId(null);
                                                                        }}
                                                                    >
                                                                        <Flag size={16} style={{ marginRight: 6 }} />
                                                                        Report
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                            </div>

                                            {/* Post Content */}
                                            <p className="post-content">{post.postContent}</p>

                                            {/* Comment Input */}
                                            <div className="comment-input">
                                                <input
                                                    type="text"
                                                    placeholder="Write a comment..."
                                                    value={newComments[post.postId] || ""}
                                                    onChange={(e) => handleCommentChange(post.postId, e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" && !e.shiftKey) {
                                                            e.preventDefault(); // Prevent new line if it's a textarea, but here just safe
                                                            handleCommentSubmit(post.postId);
                                                        }
                                                    }}
                                                />

                                                <button onClick={() => handleCommentSubmit(post.postId)}>
                                                    Comment
                                                </button>
                                            </div>

                                            {/* Display Comments */}
                                            <div className="comments-list">
                                                {comments[post.postId]?.displayed?.length > 0 ? (
                                                    comments[post.postId].displayed.map((comment) => (
                                                        <div key={comment.commentId} className="comment-card">
                                                            <img
                                                                src={`https://localhost:7029/images/prof_pics/${comment.user.profilePic}`}
                                                                alt="User"
                                                                className="profile-pic"
                                                            />
                                                            <div className="comments">
                                                                <h5>{comment.user.username}</h5>
                                                                <p>{comment.commentContent}</p>
                                                                <p className="post-time">
                                                                    {new Date(comment.createdAt).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            {/*console.log("Logged-in User ID:", localStorage.getItem("userId")) }
                                                            {console.log("Comment User ID:", comment.userId)}
                                                            {console.log("Event Creator ID:", event?.orgId)}
                                                            {console.log("User Role:", localStorage.getItem("userRole")) */}

                                                            {/* Show Three-dot menu for Edit/Delete */}
                                                            <div className="comment-actions">
                                                                <button onClick={() => openCommentMenu(comment.commentId)}>⋮</button>
                                                                {selectedCommentId === comment.commentId && (
                                                                    <div className="dropdown-menu">
                                                                        {/* Edit - only if user owns the comment */}
                                                                        {parseInt(comment.userId) === parseInt(localStorage.getItem("userId")) && (
                                                                            <button onClick={() => handleEditComment(comment, post.postId)}>
                                                                                <Edit2 size={16} style={{ marginRight: 6 }} />
                                                                                Edit
                                                                            </button>
                                                                        )}

                                                                        {/* Delete - if user owns the comment OR is admin OR is event organizer */}
                                                                        {(parseInt(comment.userId) === parseInt(localStorage.getItem("userId")) ||
                                                                            localStorage.getItem("userRole") === "Admin" ||
                                                                            (event && parseInt(event.orgId) === parseInt(localStorage.getItem("userId")))) && (
                                                                                <button onClick={() => handleOpenDeleteModal(comment, post.postId)} className="btn-delete">
                                                                                    <Trash2 size={16} style={{ marginRight: 6 }} />
                                                                                    Delete
                                                                                </button>
                                                                            )}

                                                                        {/* Report - if user does NOT own the comment */}
                                                                        {parseInt(comment.userId) !== parseInt(localStorage.getItem("userId")) && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedReportTarget({ type: "comment", id: comment.commentId });
                                                                                    setShowReportModal(true);
                                                                                    setReportMenuTargetId(null);
                                                                                }}
                                                                            >
                                                                                <Flag size={16} style={{ marginRight: 6 }} />
                                                                                Report
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>




                                                        </div>
                                                    ))
                                                ) : (
                                                    <p>No comments yet.</p>
                                                )}

                                                {comments[post.postId]?.hasMore && (
                                                    <button onClick={() => handleLoadFullComments(post.postId)}>
                                                        Show all comments
                                                    </button>
                                                )}

                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No posts yet. Be the first to share something!</p>
                                )}
                            </div>


                        
                    </>
                ) : (
                    <p className="loading-text">Loading...</p>
                )}
            </div>

            {/* Modal for confirming comment deletion */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <h3>Are you sure you want to delete this comment?</h3>
                        <div className="modal-actions">
                            <button
                                onClick={handleConfirmDelete}
                                className="btn-confirm"
                            >
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

            {/* modal window to edit the content of a comment */ }
            {editCommentData && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <h3>Edit Comment</h3>
                        <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            rows={4}
                        />
                        <div className="modal-actions">
                            <button onClick={() => setEditCommentData(null)} className="btn-cancel">Cancel</button>
                            <button onClick={async () => {
                                const token = localStorage.getItem("token");
                                try {
                                    const response = await fetch(`https://localhost:7029/api/comments/edit/${editCommentData.comment.commentId}`, {
                                        method: "PUT",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Authorization: `Bearer ${token}`,
                                        },
                                        body: JSON.stringify({ commentContent: editCommentText }),
                                    });

                                    if (!response.ok) {
                                        throw new Error("Failed to edit comment.");
                                    }

                                    fetchComments(editCommentData.postId);
                                    setEditCommentData(null);
                                } catch (error) {
                                    console.error("Error editing comment:", error);
                                }
                            }} className="post-btn">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}


            
            {showReportModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        {reportSubmitted ? (
                            <>
                                <span style={{ fontSize: "3rem", color: "green", display: "block", textAlign: "center" }}>
                                    ✔️
                                </span>
                                <h3>Thank you for informing us!</h3>
                                <p>
                                    Admin user will revise your report and will do the necessary actions for it.
                                </p>
                                <div className="modal-actions">
                                    <button
                                        onClick={() => {
                                            setShowReportModal(false);
                                            setReportSubmitted(false); // reset for future reports
                                        }}
                                        className="btn-confirm"
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>Why are you reporting this content?</h3>
                                    <div className="modal-actions modal-reasons">
                                    {["Spam", "Harassment", "Misinformation", "Hate Speech", "Other"].map((reason) => (
                                        <button
                                            key={reason}
                                            onClick={() => handleReport(reason)}
                                            className="post-btn"
                                        >
                                            {reason}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setShowReportModal(false)}
                                        className="btn-cancel"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}



        </div>
    );
}

export default EventDetails;
