import React, { useEffect, useState } from 'react';
import OrganizationSidebar from '../components/OrganizationSidebar';
import '../styles/OrganizationDashboard.css';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function OrganizationDashboard() {
    const userId = localStorage.getItem("userId");

    const [stats, setStats] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadConversations, setUnreadConversations] = useState([]);
    const [unreadCountsByConvId, setUnreadCountsByConvId] = useState({});


    const [weeklyPostCount, setWeeklyPostCount] = useState(0);
    const [weeklyCommentCount, setWeeklyCommentCount] = useState(0);
    const [weeklyReviewCount, setWeeklyReviewCount] = useState(0);
    const [detailedPosts, setDetailedPosts] = useState([]);
    const [detailedComments, setDetailedComments] = useState([]);
    const [detailedReviews, setDetailedReviews] = useState([]);

    const [attendeeGrowthData, setAttendeeGrowthData] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const [events, setEvents] = useState([]);
    const [carouselIndex, setCarouselIndex] = useState(0);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalContentType, setModalContentType] = useState(null); // 'posts', 'comments', 'reviews'

    // Fetch dashboard stats + events
    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    throw new Error('No user ID found in localStorage');
                }

                // Fetch stats as before
                const statsRes = await fetch(`https://localhost:7029/api/profile/stats/${userId}`);
                if (!statsRes.ok) throw new Error(await statsRes.text());
                const statsData = await statsRes.json();

                const unreadRes = await fetch(`https://localhost:7029/api/messages/unread-count/${userId}`);
                if (!unreadRes.ok) throw new Error(await unreadRes.text());
                const unread = await unreadRes.json();

                //fetch conversations
                const convRes = await fetch(`https://localhost:7029/api/conversation/${userId}`);
                if (!convRes.ok) throw new Error(await convRes.text());
                const convData = await convRes.json();

                const unreadConvs = convData.filter(conv => conv.hasUnreadMessages);
                setUnreadConversations(unreadConvs);

                // after fetching conversations:
                const unreadCountsRes = await fetch(`https://localhost:7029/api/messages/unread-counts/${userId}`);
                if (!unreadCountsRes.ok) throw new Error(await unreadCountsRes.text());
                const unreadCountsData = await unreadCountsRes.json();
                setUnreadCountsByConvId(unreadCountsData);


                const postsRes = await fetch(`https://localhost:7029/api/posts/event-post-count-last-week/${userId}`);
                if (!postsRes.ok) throw new Error(await postsRes.text());
                const postCount = await postsRes.json();

                const commentsRes = await fetch(`https://localhost:7029/api/comments/event-comment-count-last-week/${userId}`);
                if (!commentsRes.ok) throw new Error(await commentsRes.text());
                const commentCount = await commentsRes.json();

                const reviewRes = await fetch(`https://localhost:7029/api/reviews/count-last-week/${userId}`);
                if (!reviewRes.ok) throw new Error(await reviewRes.text());
                const reviewCount = await reviewRes.json();

                const postsDetailRes = await fetch(`https://localhost:7029/api/posts/organization/${userId}`);
                if (!postsDetailRes.ok) throw new Error(await postsDetailRes.text());
                const detailedPostData = await postsDetailRes.json();
                setDetailedPosts(detailedPostData);

                const commentsDetailRes = await fetch(`https://localhost:7029/api/comments/organization/${userId}`);
                if (!commentsDetailRes.ok) throw new Error(await commentsDetailRes.text());
                const detailedCommentData = await commentsDetailRes.json();
                setDetailedComments(detailedCommentData);

                const reviewsDetailRes = await fetch(`https://localhost:7029/api/reviews/organization/${userId}`);
                if (!reviewsDetailRes.ok) throw new Error(await reviewsDetailRes.text());
                const detailedReviewData = await reviewsDetailRes.json();
                setDetailedReviews(detailedReviewData);


                const growthRes = await fetch(`https://localhost:7029/api/events/attendee-growth/${userId}`);
                if (!growthRes.ok) throw new Error(await growthRes.text());
                const growthData = await growthRes.json();

                setAttendeeGrowthData(growthData);
                setWeeklyReviewCount(reviewCount);
                setWeeklyCommentCount(commentCount);
                setStats(statsData);
                setUnreadCount(unread);
                setWeeklyPostCount(postCount);

                // Fetch events for carousel
                const eventsRes = await fetch('https://localhost:7029/api/events/events');
                if (!eventsRes.ok) throw new Error(await eventsRes.text());
                const eventsData = await eventsRes.json();

                const filteredEvents = eventsData.filter(event =>
                    event.isActive === true && event.orgId === Number(userId)
                );
                setEvents(filteredEvents);
            } catch (err) {
                console.error(err);
                setError('Failed to load dashboard data: ' + err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    // Carousel navigation handlers
    const handlePrev = () => {
        setCarouselIndex((prev) => (prev === 0 ? Math.max(events.length - 3, 0) : prev - 1));
    };

    const handleNext = () => {
        setCarouselIndex((prev) => (prev >= Math.max(events.length - 3, 0) ? 0 : prev + 1));
    };

    // Show up to 3 events in the carousel viewport
    const visibleEvents = events.slice(carouselIndex, carouselIndex + 3);

    const openModal = (type) => {
        setModalContentType(type);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalContentType(null);
    };

    return (
        <div className="dashboard-container">
            
            {/* Main Content */}
            <div className="main-content">
                <h2 className="main-title">Organization Dashboard</h2>

                {loading && <p>Loading...</p>}
                {error && <p className="error">{error}</p>}

                {stats && (
                    <div className="dashboard-stats grid-layout">
                        <div className="stat-card">
                            <h3>Total Events Organized: {stats.totalEventsOrganized ?? 0}</h3>
                       
                            <h3>Event Attendance</h3>
                            <ul>
                                {(stats.eventAttendance || []).map((event, index) => (
                                    <li key={index}>
                                        <a
                                            href={`https://localhost:53073/event-details/${event.eventId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="event-link"
                                        >
                                            {event.title ?? "Untitled"}
                                        </a>
                                        {" - "}Attendees: {event.attendees ?? 0}
                                    </li>
                                ))}
                            </ul>

                        </div>

                        <div className="stat-card">
                            <h3>Unread Messages: {unreadCount}</h3>
                            {unreadConversations.length === 0 ? (
                                <p>No unread conversations</p>
                            ) : (
                                    <ul className="unread-conv-list" style={{ listStyleType: "none", paddingLeft: 0, marginLeft: 0 }}>
                                        {unreadConversations.map(conv => {
                                            const userIdInt = parseInt(userId); // logged-in user ID as number

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
                                                                {filtered
                                                                    .map(p => p.username === "Deactivated account" ? "Deleted/Deactivated Account" : p.username)
                                                                    .join(", ")}
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


                        <div className="stat-card">
                            <h3>New Posts in Your Events (Last 7 Days): {weeklyPostCount}</h3>
                            {detailedPosts.length === 0 ? <p>No posts</p> : (
                                <ul>
                                    {detailedPosts.slice(0, 2).map(post => (
                                        <li key={post.postId}>
                                            <strong>{post.User?.username}</strong> on <em>{post.eventTitle}</em>: {post.postContent} by <em>{post.user.username}</em>
                                            <br />
                                            <small>{new Date(post.createdAt).toLocaleString()}</small>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {detailedPosts.length > 3 && (
                                <button onClick={() => openModal('posts')}>Show More</button>
                            )}

                        </div>
                        <div className="stat-card">
                            <h3>New Comments in Your Events (Last 7 Days): {weeklyCommentCount}</h3>
                            {detailedComments.length === 0 ? <p>No comments</p> : (
                                <ul>
                                    {detailedComments.slice(0, 2).map(comment => (
                                        <li key={comment.commentId}>
                                            <strong>{comment.User?.username}</strong> on <em>{comment.event.title}</em>: {comment.commentContent} by <em>{comment.user.username}</em>
                                            <br />
                                            <small>{new Date(comment.createdAt).toLocaleString()}</small>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {detailedComments.length > 3 && (
                                <button onClick={() => openModal('comments')}>Show More</button>
                            )}

                        </div>
                        <div className="stat-card">
                            <h3>New Reviews (Last 7 Days): {weeklyReviewCount}</h3>
                            {detailedReviews.length === 0 ? <p>No reviews</p> : (
                                <ul>
                                    {detailedReviews.slice(0, 3).map(review => (
                                        <li key={review.reviewId}>
                                            <strong>{review.User?.username}</strong> rated <em>{review.reviewedEntity}</em> {review.rating}/5 by <em>{review.reviewerUsername}</em>
                                            <br />
                                            {review.comment}
                                            <br />
                                            <small>{new Date(review.createdAt).toLocaleString()}</small>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {detailedReviews.length > 3 && (
                                <button onClick={() => openModal('reviews')}>Show More</button>
                            )}

                        </div>

                        <div className="stat-card full-width">
                            <h3>Attendee Growth Over Time</h3>
                            <div className="chart-container">
                                <ResponsiveContainer>
                                    <LineChart data={attendeeGrowthData}>
                                        <CartesianGrid stroke="#ccc" />
                                        <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                                        <YAxis />
                                        <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                                        <Line type="monotone" dataKey="count" stroke="#28a745" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                )}
                {/* Carousel Card */}
                <div className="stat-card full-width">
                    <h3>Your Upcoming Events</h3>
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

            </div>
            {modalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal}>X</button>
                        <h3>
                            {modalContentType === 'posts' && 'All Posts'}
                            {modalContentType === 'comments' && 'All Comments'}
                            {modalContentType === 'reviews' && 'All Reviews'}
                        </h3>

                        <ul className="modal-list">
                            {modalContentType === 'posts' && detailedPosts.map((post, idx) => (
                                <li key={post.postId} className="modal-item">
                                    <strong>{post.User?.username}</strong> on <em>{post.eventTitle}</em>: {post.postContent}
                                    <br />
                                    <small>{new Date(post.createdAt).toLocaleString()}</small>
                                </li>
                            ))}

                            {modalContentType === 'comments' && detailedComments.map((comment, idx) => (
                                <li key={comment.commentId} className="modal-item">
                                    <strong>{comment.User?.username}</strong> on <em>{comment.event.title}</em>: {comment.commentContent}
                                    <br />
                                    <small>{new Date(comment.createdAt).toLocaleString()}</small>
                                </li>
                            ))}

                            {modalContentType === 'reviews' && detailedReviews.map((review, idx) => (
                                <li key={review.reviewId} className="modal-item">
                                    <strong>{review.User?.username}</strong> rated <em>{review.reviewedEntity}</em> {review.rating}/5
                                    <br />
                                    {review.comment}
                                    <br />
                                    <small>{new Date(review.createdAt).toLocaleString()}</small>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}



        </div>
    );
}

export default OrganizationDashboard;
