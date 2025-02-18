import React from 'react';
import RegUserSidebar from '../components/RegUserSidebar';

import '../styles/OrganizationDashboard.css';

function RegUserDashboard() {
    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <RegUserSidebar />

            {/* Main Content */}
            <div className="main-content">
                <h2 className="main-title">Regular User Dashboard</h2>
                <div className="main-text">
                    Here is where the dashboard content will go.
                </div>
            </div>
        </div>
    );
}

export default RegUserDashboard;
