import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../../styles/EventsStyles.css";
import OrganizationSidebar from '../../components/OrganizationSidebar';
import RegUserSidebar from '../../components/RegUserSidebar';


function EventDetails() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [profilePic, setProfilePic] = useState("default-profile.jpg");

    const [user, setUser] = useState({ username: "", profilePic: "" });
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [comments, setComments] = useState({}); // To store comments for each post
    const [newComments, setNewComments] = useState({});


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
            const response = await fetch(`https://localhost:7029/api/comments/post/${postId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch comments");
            }
            const data = await response.json();

            // Sort the comments by CreatedAt (oldest first)
            const sortedComments = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            setComments(prevComments => ({
                ...prevComments,
                [postId]: sortedComments, // Store sorted comments for the specific postId
            }));
        } catch (error) {
            console.error("Error fetching comments:", error);
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



    return (
        <div style={{ display: "flex", height: "100vh", marginTop: "-10px" }}>
            {/* Sidebar */}
            {userRole === "Organization" ? <OrganizationSidebar /> : <RegUserSidebar />}

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

                        {/* Event Title */}
                        <div className="event-title-container">
                            <h1 className="event-title">{event.title}</h1>
                        </div>

                        {/* Event Info Card */}
                        <div className="event-info-card">
                            <h3>Event Details</h3>
                            <p><strong>📍 Location:</strong> {event.location}</p>
                            <p><strong>📅 Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
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
                                <img src={`https://localhost:7029/images/${profilePic}`} alt="Profile" className="profile-pic" />
                                <input
                                    type="text"
                                    placeholder="Write something..."
                                    className="post-input"
                                    onClick={() => setIsModalOpen(true)}
                                />
                            </div>

                            {/* Post Modal */}
                            {isModalOpen && (
                                <div className="modal">
                                    <div className="modal-content">
                                        <h3>Create a Post</h3>
                                        <textarea
                                            className="modal-textarea"
                                            placeholder="Share something about this event..."
                                            value={newPost}
                                            onChange={(e) => setNewPost(e.target.value)}
                                        />
                                        <div className="modal-actions">
                                            <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
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
                                            <div className="post-header">
                                                <img
                                                    src={`https://localhost:7029/images/${profilePic}`}
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

                                            {/* Post Content */}
                                            <p className="post-content">{post.postContent}</p>

                                            {/* Comment Input */}
                                            <div className="comment-input">
                                                <input
                                                    type="text"
                                                    placeholder="Write a comment..."
                                                    value={newComments[post.postId] || ""} // Use the specific comment for this post
                                                    onChange={(e) => handleCommentChange(post.postId, e.target.value)} // Update specific comment
                                                />
                                                <button onClick={() => handleCommentSubmit(post.postId)}>
                                                    Comment
                                                </button>
                                            </div>

                                            {/* Display Comments */}
                                            <div className="comments-list">
                                                {comments[post.postId]?.length > 0 ? (
                                                    comments[post.postId].map((comment) => (
                                                        <div key={comment.commentId} className="comment-card">
                                                            <img
                                                                src={`https://localhost:7029/images/${comment.user.profilePic}`}
                                                                alt="User"
                                                                className="profile-pic"
                                                            />
                                                            <div className="comments" >
                                                                <h5>{comment.user.username}</h5>
                                                                <p>{comment.commentContent}</p>
                                                                <p className="comment-time">
                                                                    {new Date(comment.createdAt).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p>No comments yet.</p>
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
        </div>
    );
}

export default EventDetails;
