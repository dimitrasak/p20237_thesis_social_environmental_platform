import React from 'react';
import OrganizationSidebar from '../components/OrganizationSidebar';

import '../styles/OrganizationDashboard.css';

function OrganizationDashboard() {
    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <OrganizationSidebar />

            {/* Main Content */}
            <div className="main-content">
                <h2 className="main-title">Organization Dashboard</h2>
                <div className="main-text">
                    Here is where the dashboard content will go.
                </div>
            </div>
        </div>
    );
}

export default OrganizationDashboard;
