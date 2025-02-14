import React from 'react';
import OrganizationSidebar from '../../components/OrganizationSidebar';
import { useNavigate } from 'react-router-dom';

function Events() {
    const navigate = useNavigate();

    const handleCreateEvent = () => {
        navigate('/add-event');
    };

    return (         
        <div className="dashboard-container">
            {/* Sidebar */}
            <OrganizationSidebar />

            {/* Main Content */}
            <div className="main-content">
                <h2 className="main-title">Events</h2>
                <div className="main-text">
                    <button onClick={handleCreateEvent} className="create-event-button">
                        Create New Event
                    </button>
                </div>
            </div>
        </div>
        
    );
}

export default Events;
