import React from 'react';

function AboutPage() {
    return (
        <div className="dashboard-container flex">
            {/* {role === "Organization" ? <OrganizationSidebar /> : <RegUserSidebar />} */}
            <div className="main-content flex-1 p-4" style={{ paddingTop: '60px' }}>
                <h2 className="main-title text-2xl font-bold mb-4">About Us</h2>
                <p>This is an open platform to be used by individuals and organisations with the same aim to save our planet.</p>
            </div>
        </div>
    );
}

export default AboutPage;