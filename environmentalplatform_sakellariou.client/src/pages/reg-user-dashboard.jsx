import React, { useEffect, useState } from 'react';
import '../styles/OrganizationDashboard.css';

function RegUserDashboard() {
    const [attendingEvents, setAttendingEvents] = useState([]);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadConversations, setUnreadConversations] = useState([]);
    const [unreadCountsByConvId, setUnreadCountsByConvId] = useState({});
    const [loadingMessages, setLoadingMessages] = useState(true);

    const userId = localStorage.getItem("userId");
    const userIdInt = parseInt(userId);

    const [suggestedEvents, setSuggestedEvents] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);
    const [otherPosts, setOtherPosts] = useState([]);
    const [showMorePosts, setShowMorePosts] = useState(false);

    const [latestUserPost, setLatestUserPost] = useState(null);
    const [loadingLatestPost, setLoadingLatestPost] = useState(true);
    const [errorLatestPost, setErrorLatestPost] = useState('');

    useEffect(() => {
        const fetchSuggestedEvents = async () => {
            try {
                const res = await fetch(`https://localhost:7029/api/events/suggested-events/${userId}`);
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                setSuggestedEvents(data);
            } catch (err) {
                console.error("Error fetching suggested events:", err);
            } finally {
                setLoadingSuggestions(false);
            }
        };
        fetchSuggestedEvents();
    }, [userId]);

    useEffect(() => {
        const fetchAttendingEvents = async () => {
            try {
                const res = await fetch(`https://localhost:7029/api/events/user-attending-events/${userId}`);
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                const activeOnly = data.filter(e => e.isActive);
                setAttendingEvents(activeOnly);
            } catch (err) {
                setError('Failed to fetch attending events: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendingEvents();
    }, [userId]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const unreadRes = await fetch(`https://localhost:7029/api/messages/unread-count/${userId}`);
                const unread = await unreadRes.json();

                const convRes = await fetch(`https://localhost:7029/api/conversation/${userId}`);
                const convData = await convRes.json();

                const unreadConvs = convData.filter(conv => conv.hasUnreadMessages);
                setUnreadConversations(unreadConvs);

                const unreadCountsRes = await fetch(`https://localhost:7029/api/messages/unread-counts/${userId}`);
                const unreadCountsData = await unreadCountsRes.json();
                setUnreadCountsByConvId(unreadCountsData);

                setUnreadCount(unread);
            } catch (err) {
                console.error("Error fetching messages:", err);
            } finally {
                setLoadingMessages(false);
            }
        };
        fetchMessages();
    }, [userId]);

    useEffect(() => {
        const fetchLatestUserPost = async () => {
            setLoadingLatestPost(true);
            try {
                const res = await fetch(`https://localhost:7029/api/posts/user-recent/${userId}`);
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();

                if (data.length > 0) {
                    setLatestUserPost(data[0]);
                    setOtherPosts(data.slice(1));
                } else {
                    setLatestUserPost(null);
                    setOtherPosts([]);
                }
            } catch (err) {
                setErrorLatestPost('Failed to fetch latest post: ' + err.message);
            } finally {
                setLoadingLatestPost(false);
            }
        };
        if (userId) {
            fetchLatestUserPost();
        }
    }, [userId]);

    const handlePrev = () => {
        setCarouselIndex(prev => (prev === 0 ? Math.max(attendingEvents.length - 3, 0) : prev - 1));
    };

    const handleNext = () => {
        setCarouselIndex(prev => (prev >= Math.max(attendingEvents.length - 3, 0) ? 0 : prev + 1));
    };

    const visibleEvents = attendingEvents.slice(carouselIndex, carouselIndex + 3);

    return (
        <div className="dashboard-container">
            <div className="main-content">
                <h2 className="main-title">Regular User Dashboard</h2>

                <div className="dashboard-stats">

                    {/* Unread Messages */}
                    <div className="stat-card">
                        <h3>Unread Messages: {unreadCount}</h3>
                        {unreadConversations.length === 0 ? (
                            <p>No unread conversations</p>
                        ) : (
                            <ul className="unread-conv-list">
                                {unreadConversations.map(conv => {
                                    const otherParticipantIds = conv.participantIds.filter(id => id !== userIdInt);
                                    const filtered = otherParticipantIds.map((id, idx) => ({
                                        id,
                                        username: conv.participantUsernames[idx] || "Unknown User",
                                        profilePic: conv.participantProfilePictures[idx] || "default-profile.jpg"
                                    }));
                                    const isGroup = filtered.length > 1;
                                    const unreadCountForConv = unreadCountsByConvId[conv.convId] || 0;

                                    return (
                                        <li key={conv.convId} className="unread-conv-item">
                                            <a href={`/messages/${conv.convId}`} className="unread-conv-link">
                                                {isGroup ? (
                                                    <span>
                                                        {filtered.map(p => p.username === "Deactivated account" ? "Deleted/Deactivated Account" : p.username).join(", ")}
                                                        {unreadCountForConv > 0 && (
                                                            <span className="unread-badge">{unreadCountForConv}</span>
                                                        )}
                                                    </span>
                                                ) : (
                                                    <div className="user-info">
                                                        <img
                                                            src={`https://localhost:7029/images/prof_pics/${filtered[0]?.profilePic}`}
                                                            alt="avatar"
                                                            className="small-avatar"
                                                        />
                                                        <span className="username-with-badge">
                                                            {filtered[0]?.username === "Deactivated account" ? "Deleted/Deactivated Account" : filtered[0]?.username}
                                                            {unreadCountForConv > 0 && (
                                                                <span className="unread-badge">{unreadCountForConv}</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Events Carousel */}
                    {loading ? (
                        <p>Loading events...</p>
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : (
                        <div className="stat-card full-width">
                            <h3>Upcoming Events You're Attending</h3>
                            <div className="carousel-container">
                                <button onClick={handlePrev} className="carousel-btn">{'<'}</button>
                                <div className="carousel-view">
                                    {visibleEvents.length === 0 && <p>No events to show</p>}
                                    {visibleEvents.map(event => (
                                        <div
                                            key={event.eventId}
                                            className="carousel-card"
                                            onClick={() => window.location.href = `/event-details/${event.eventId}`}
                                        >
                                            <img
                                                src={event.imageUrl ? `https://localhost:7029${event.imageUrl.replace(/\\/g, '/')}` : 'https://picsum.photos/300/180'}
                                                alt={event.title}
                                                className="carousel-img"
                                            />
                                            <p className="carousel-title">{event.title}</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleNext} className="carousel-btn">{'>'}</button>
                            </div>
                        </div>
                    )}

                    {/* Suggested Events */}
                    <div className="stat-card">
                        <h3>Suggested Events for You</h3>
                        {loadingSuggestions ? (
                            <p>Loading suggestions...</p>
                        ) : suggestedEvents.length === 0 ? (
                            <p>No suggestions available.</p>
                        ) : (
                            <div className="suggested-events-grid">
                                {suggestedEvents.map(event => (
                                    <div
                                        key={event.eventId}
                                        className="suggested-event-card"
                                        onClick={() => window.location.href = `/event-details/${event.eventId}`}
                                    >
                                        <img
                                            src={event.imageUrl ? `https://localhost:7029${event.imageUrl.replace(/\\/g, '/')}` : 'https://picsum.photos/300/180'}
                                            alt={event.title}
                                            className="carousel-img"
                                        />
                                        <p className="carousel-title">{event.title}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Latest Post and More Posts */}
                    <div className="stat-card full-width">
                        <h3>Your Posts and Replies for the Past 7 Days</h3>
                        {loadingLatestPost ? (
                            <p>Loading latest post...</p>
                        ) : errorLatestPost ? (
                            <p className="error">{errorLatestPost}</p>
                        ) : latestUserPost ? (
                            <>
                                <div className="post-thread">
                                    <div className="post-content">
                                        <p>
                                            <strong>Post:</strong> {latestUserPost.postContent} in{" "}
                                            <a href={`/event-details/${latestUserPost.eventId}`}>
                                                <em>{latestUserPost.eventName}</em>
                                            </a>
                                        </p>
                                        <small>Posted on: {new Date(latestUserPost.createdAt).toLocaleString()}</small>
                                    </div>
                                    <div className="comments-section">
                                        <h4>Comments by others:</h4>
                                        {latestUserPost.comments.length === 0 ? (
                                            <p>No comments from other users yet.</p>
                                        ) : (
                                            latestUserPost.comments.map(comment => (
                                                <div key={comment.commentId} className="comment bubble-comment">
                                                    <div className="user-info">
                                                        <img
                                                            src={`https://localhost:7029/images/prof_pics/${comment.user.profilePic}`}
                                                            alt={comment.user.username}
                                                            className="small-avatar"
                                                        />
                                                        {/*<span>{comment.user.username}</span>*/}
                                                    </div>
                                                    <div className="bubble-content">
                                                        <p>{comment.commentContent}</p>
                                                        <small>{new Date(comment.createdAt).toLocaleString()}</small>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <hr />

                                {otherPosts.length > 0 && (
                                    !showMorePosts ? (
                                            <button className="toggle-posts-button" onClick={() => setShowMorePosts(true)}>Show More Posts</button>
                                    ) : (
                                        <>
                                            <div className="more-posts">
                                                {otherPosts.map((post, index) => (
                                                    <React.Fragment key={post.postId}>
                                                        <div className="post-thread" style={{ marginTop: '20px' }}>
                                                            <div className="post-content">
                                                                <p>
                                                                    <strong>Post:</strong> {post.postContent} in{" "}
                                                                    <a href={`/event-details/${post.eventId}`}>
                                                                        <em>{post.eventName}</em>
                                                                    </a>
                                                                </p>
                                                                <small>Posted on: {new Date(post.createdAt).toLocaleString()}</small>
                                                            </div>
                                                            <div className="comments-section">
                                                                <h4>Comments by others:</h4>
                                                                {post.comments.length === 0 ? (
                                                                    <p>No comments from other users yet.</p>
                                                                ) : (
                                                                    post.comments.map(comment => (
                                                                        <div key={comment.commentId} className="comment bubble-comment">
                                                                            <div className="user-info">
                                                                                <img
                                                                                    src={`https://localhost:7029/images/prof_pics/${comment.user.profilePic}`}
                                                                                    alt={comment.user.username}
                                                                                    className="small-avatar"
                                                                                />
                                                                                {/*<span>{comment.user.username}</span> */}
                                                                            </div>
                                                                            <div className="bubble-content">
                                                                                <p>{comment.commentContent}</p>
                                                                                <small>{new Date(comment.createdAt).toLocaleString()}</small>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </div>
                                                        {index < otherPosts.length - 1 && <hr />}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                                <button className="toggle-posts-button" onClick={() => setShowMorePosts(false)}>Hide Posts</button>
                                        </>
                                    )
                                )}
                            </>
                        ) : (
                            <p>You have no posts in the last 7 days.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegUserDashboard;
