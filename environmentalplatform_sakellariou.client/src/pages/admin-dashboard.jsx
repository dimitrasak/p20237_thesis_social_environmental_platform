import React from 'react';
import AdminSidebar from '../components/AdminSidebar';

import '../styles/OrganizationDashboard.css';

function AdminDashboard() {
    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            {/*<AdminSidebar /> */}

            {/* Main Content */}
            <div className="main-content">
                <h2 className="main-title">Admin Dashboard</h2>
                <div className="main-text">
                    Here is where the dashboard content will go.
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
