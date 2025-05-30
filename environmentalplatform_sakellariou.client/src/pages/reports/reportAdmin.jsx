import React, { useEffect, useState } from "react";

const ReportAdmin = () => {
    const [reports, setReports] = useState([]);
    const [message, setMessage] = useState(null);
    const [modalInfo, setModalInfo] = useState(null);
    const [viewPostContent, setViewPostContent] = useState(null);

    //for sorting filters
    const [statusFilter, setStatusFilter] = useState("All"); //based on status
    const [typeFilter, setTypeFilter] = useState("All"); //based on type of the report (post or comment)

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await fetch("https://localhost:7029/api/Reports");
            const data = await res.json();
            setReports(data);
        } catch (err) {
            console.error("Error fetching reports:", err);
        }
    };

    const handleAction = async (reportId, action) => {
        try {
            const res = await fetch(`https://localhost:7029/api/Reports/${action}/${reportId}`, {
                method: "POST",
            });

            if (!res.ok) throw new Error(`Failed to ${action} report`);

            await fetchReports(); // Refresh full list after action
            setMessage({ type: "success", text: `Report ${action}ed successfully.` });
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setTimeout(() => setMessage(null), 5000);
            setModalInfo(null);
        }
    };


    const openModal = (report, actionType) => {
        setModalInfo({ report, actionType });
    };

    const isDefined = (val) => val !== null && val !== undefined;

    return (
        <div className="dashboard-container">
            <div className="main-content">
                <h2>Reports Management</h2>

                {message && (
                    <p style={{ color: message.type === "success" ? "green" : "red", fontWeight: "bold" }}>
                        {message.text}
                    </p>
                )}

                <div style={{ marginBottom: "1rem", display: "flex", gap: "20px" }}>
                    <div>
                        <label>Status: </label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Declined">Declined</option>
                        </select>
                    </div>
                    <div>
                        <label>Type: </label>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option value="All">All</option>
                            <option value="Post">Post</option>
                            <option value="Comment">Comment</option>
                        </select>
                    </div>
                </div>


                <table border="1" cellPadding="10">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Reason</th>
                            <th>Reported Content</th>
                            <th>Reported By</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports
                            .filter(report => {
                                const reportType = report.commentId ? "Comment" : report.postId ? "Post" : "Unknown";
                                const matchesStatus = statusFilter === "All" || report.status === statusFilter;
                                const matchesType = typeFilter === "All" || reportType === typeFilter;
                                return matchesStatus && matchesType;
                            })
                            .map(report => {

                            const isComment = !!report.commentId;
                            const type = isComment ? "Comment" : report.postId ? "Post" : "Unknown";
                            const content = isComment
                                ? report.commentContent || "Comment missing"
                                : report.postContent || "Post missing";
                            const contentAuthor = isComment
                                ? report.commentAuthorUsername || "Unknown"
                                : report.postAuthorUsername || "Unknown";

                            return (
                                <tr key={report.reportId}>
                                    <td>{report.reportId}</td>
                                    <td>{type}</td>
                                    <td>{report.reason}</td>
                                    <td>
                                        <div><strong>By:</strong> {contentAuthor}</div>
                                        <div>{content}</div>

                                        {!isComment && isDefined(report.eventId) && (
                                            <div style={{ marginTop: "5px" }}>
                                                <a
                                                    href={`https://localhost:53073/event-details/${report.eventId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ fontSize: "0.8rem", color: "blue", textDecoration: "underline" }}
                                                >
                                                    Go to Event Page
                                                </a>
                                            </div>
                                        )}

                                        {isComment && report.parentPostContent && (
                                            <button
                                                onClick={() =>
                                                    setViewPostContent({
                                                        content: report.parentPostContent,
                                                        author: report.parentPostAuthorUsername || "Unknown",
                                                        eventId: report.parentPostEventId
                                                    })
                                                }
                                                style={{
                                                    display: "block",
                                                    marginTop: "5px",
                                                    fontSize: "0.8rem",
                                                    background: "none",
                                                    border: "none",
                                                    color: "blue",
                                                    textDecoration: "underline",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                View Parent Post
                                            </button>
                                        )}
                                    </td>
                                    <td>{report.username || "Unknown"}</td>
                                    <td>{report.status || "Pending"}</td>
                                    <td>{new Date(report.createdAt).toLocaleString()}</td>
                                    <td>
                                        <button
                                            onClick={() => openModal(report, "accept")}
                                            style={{ color: "green" }}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => openModal(report, "decline")}
                                            style={{ color: "red", marginLeft: "10px" }}
                                        >
                                            Decline
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Action Confirmation Modal */}
                {modalInfo && (
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <h3>Confirm {modalInfo.actionType} Report</h3>
                            <p>
                                Are you sure you want to <strong>{modalInfo.actionType}</strong> report ID {modalInfo.report.reportId}?
                            </p>
                            <div className="modal-actions">
                                <button
                                    onClick={() => handleAction(modalInfo.report.reportId, modalInfo.actionType)}
                                    className="btn-confirm"
                                >
                                    Yes, {modalInfo.actionType}
                                </button>
                                <button onClick={() => setModalInfo(null)} className="btn-cancel">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Parent Post Modal */}
                {viewPostContent && (
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <h3>Parent Post</h3>
                            <p><strong>By:</strong> {viewPostContent.author}</p>
                            <p>{viewPostContent.content}</p>
                            {isDefined(viewPostContent.eventId) && (
                                <p style={{ marginTop: "10px" }}>
                                    <a
                                        href={`https://localhost:53073/event-details/${viewPostContent.eventId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: "0.9rem", color: "blue", textDecoration: "underline" }}
                                    >
                                        Go to Event Page
                                    </a>
                                </p>
                            )}
                            <button onClick={() => setViewPostContent(null)} className="btn-cancel">Close</button>
                        </div>
                    </div>
                )}

                <style>{`
                    .modal-overlay {
                        position: fixed;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0,0,0,0.5);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1000;
                    }
                    .modal-container {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        max-width: 400px;
                        width: 100%;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                        text-align: center;
                    }
                    .modal-actions button {
                        margin: 10px;
                        padding: 10px 20px;
                    }
                    .btn-confirm {
                        background: green;
                        color: white;
                        border: none;
                    }
                    .btn-cancel {
                        background: grey;
                        color: white;
                        border: none;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default ReportAdmin;
