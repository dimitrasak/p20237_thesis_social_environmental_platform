import React, { useEffect, useState } from 'react';
import '../styles/OrganizationDashboard.css';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function AdminDashboard() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadConversations, setUnreadConversations] = useState([]);
    const [unreadCountsByConvId, setUnreadCountsByConvId] = useState({});

    const [newUsersCount, setNewUsersCount] = useState(0);
    const [pendingReportsCount, setPendingReportsCount] = useState(0);
    const [recentEventsCount, setRecentEventsCount] = useState(0);
    const [recentEvents, setRecentEvents] = useState([]);

    // New state for report stats over time
    const [reportStats, setReportStats] = useState([]);
    const [reportStatsLoading, setReportStatsLoading] = useState(true);
    const [reportStatsError, setReportStatsError] = useState('');

    const [carouselIndex, setCarouselIndex] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        async function fetchAdminData() {
            try {
                // Fetch all data (same as before)
                const unreadRes = await fetch(`https://localhost:7029/api/messages/unread-count/${userId}`);
                if (!unreadRes.ok) throw new Error(await unreadRes.text());
                setUnreadCount(await unreadRes.json());

                const convRes = await fetch(`https://localhost:7029/api/conversation/${userId}`);
                if (!convRes.ok) throw new Error(await convRes.text());
                const convData = await convRes.json();
                setUnreadConversations(convData.filter(conv => conv.hasUnreadMessages));

                const unreadCountsRes = await fetch(`https://localhost:7029/api/messages/unread-counts/${userId}`);
                if (!unreadCountsRes.ok) throw new Error(await unreadCountsRes.text());
                setUnreadCountsByConvId(await unreadCountsRes.json());

                const usersRes = await fetch('https://localhost:7029/api/users/users-signedup-last-7days');
                if (!usersRes.ok) throw new Error(await usersRes.text());
                setNewUsersCount(await usersRes.json());

                const reportsRes = await fetch('https://localhost:7029/api/reports/pending-count');
                if (!reportsRes.ok) throw new Error(await reportsRes.text());
                setPendingReportsCount(await reportsRes.json());

                const eventsCountRes = await fetch('https://localhost:7029/api/events/events-created-last-7days/count');
                if (!eventsCountRes.ok) throw new Error(await eventsCountRes.text());
                setRecentEventsCount(await eventsCountRes.json());

                const eventsRes = await fetch('https://localhost:7029/api/events/events-created-last-7days');
                if (!eventsRes.ok) throw new Error(await eventsRes.text());
                setRecentEvents(await eventsRes.json());
            } catch (err) {
                console.error(err);
                setError('Failed to load admin dashboard data: ' + err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchAdminData();
    }, [userId]);

    // Fetch reports stats for chart
    useEffect(() => {
        async function fetchReportStats() {
            setReportStatsLoading(true);
            setReportStatsError('');
            try {
                const res = await fetch('https://localhost:7029/api/reports/status-over-time');
                if (!res.ok) throw new Error('Failed to fetch report stats');
                const rawData = await res.json();

                // Get unique dates sorted
                const datesSet = new Set(rawData.map(item => item.date));
                const dates = Array.from(datesSet).sort();

                // Define statuses to display
                const statuses = ['Pending', 'Declined'];

                // Transform data to chart-friendly format
                const chartData = dates.map(date => {
                    const dayData = { Date: date };  // note capital "Date" as your XAxis uses dataKey="Date"
                    statuses.forEach(status => {
                        // Find record with matching date & status
                        const record = rawData.find(r => r.date === date && r.status === status);
                        dayData[status] = record ? record.count : 0;
                    });
                    return dayData;
                });


                setReportStats(chartData);
            } catch (error) {
                console.error(error);
                setReportStatsError(error.message || 'Error loading report stats');
            } finally {
                setReportStatsLoading(false);
            }
        }
        fetchReportStats();
    }, []);

    const handlePrev = () => {
        setCarouselIndex((prev) => (prev === 0 ? Math.max(recentEvents.length - 3, 0) : prev - 1));
    };

    const handleNext = () => {
        setCarouselIndex((prev) => (prev >= Math.max(recentEvents.length - 3, 0) ? 0 : prev + 1));
    };

    const visibleEvents = recentEvents.slice(carouselIndex, carouselIndex + 3);

    return (
        <div className="dashboard-container">
            <div className="main-content">
                <h2 className="main-title">Admin Dashboard</h2>

                {loading && <p>Loading...</p>}
                {error && <p className="error">{error}</p>}

                <div className="dashboard-stats grid-layout">
                    {/* Messages Stat Card */}
                    <div className="stat-card">
                        <h3>Unread Messages: {unreadCount}</h3>
                        {unreadConversations.length === 0 ? (
                            <p>No unread conversations</p>
                        ) : (
                            <ul
                                className="unread-conv-list"
                                style={{ listStyleType: "none", paddingLeft: 0, marginLeft: 0 }}
                            >
                                {unreadConversations.map((conv) => {
                                    const userIdInt = parseInt(userId, 10);

                                    const otherParticipantIds = conv.participantIds.filter((id) => id !== userIdInt);

                                    const filtered = otherParticipantIds.map((id, idx) => ({
                                        id,
                                        username: conv.participantUsernames[idx] || "Unknown User",
                                        profilePic: conv.participantProfilePictures[idx] || "default-profile.jpg",
                                    }));

                                    const isGroup = filtered.length > 1;
                                    const unreadCountForConv = unreadCountsByConvId[conv.convId] || 0;

                                    return (
                                        <li key={conv.convId} className="unread-conv-item">
                                            <a href={`/messages/${conv.convId}`} className="unread-conv-link">
                                                {isGroup ? (
                                                    <span>
                                                        {filtered
                                                            .map((p) =>
                                                                p.username === "Deactivated account"
                                                                    ? "Deleted/Deactivated Account"
                                                                    : p.username
                                                            )
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
                                                            {filtered[0]?.username === "Deactivated account"
                                                                ? "Deleted/Deactivated Account"
                                                                : filtered[0]?.username}
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

                    {/* Users Signed Up Last 7 Days */}
                    <div className="stat-card">
                        <h3>New Users Signed Up (Last 7 Days): {newUsersCount}</h3>
                    </div>

                    {/* Pending Reports */}
                    <div className="stat-card">
                        <h3>Pending Reports: {pendingReportsCount}</h3>
                    </div>

                    {/* Events Created Last 7 Days */}
                    <div className="stat-card">
                        <h3>Events Created (Last 7 Days): {recentEventsCount}</h3>
                    </div>

                    {/* Carousel of Recent Events - full width */}
                    <div className="stat-card full-width">
                        <h3>Events Created in the Last 7 Days</h3>
                        <div className="carousel-container">
                            <button onClick={handlePrev} className="carousel-btn">{'<'}</button>
                            <div className="carousel-view">
                                {visibleEvents.length === 0 && <p>No recent events to show</p>}
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

                {/* --- Add Report Status Chart Below Carousel --- */}
                <div className="stat-card full-width" style={{ marginTop: '2rem' }}>
                    <h3>Reports Received and Declined Over Time</h3>
                    {reportStatsLoading && <p>Loading chart...</p>}
                    {reportStatsError && <p className="error">{reportStatsError}</p>}
                    {!reportStatsLoading && !reportStatsError && reportStats.length === 0 && <p>No data available.</p>}
                    {!reportStatsLoading && !reportStatsError && reportStats.length > 0 && (
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={reportStats} margin={{ top: 20, right: 40, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="Date" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend verticalAlign="top" height={36} />
                                <Line type="monotone" dataKey="Pending" stroke="#36a2eb" />
                                <Line type="monotone" dataKey="Declined" stroke="#ff6384" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
