import React from 'react';

function ContactPage() {
    return (        
        <div className="dashboard-container flex">
            {/* {role === "Organization" ? <OrganizationSidebar /> : <RegUserSidebar />} */}
            <div className="main-content flex-1 p-4" style={{ paddingTop: '60px' }}>
                <h2 className="main-title text-2xl font-bold mb-4">Contact</h2>            
                <p>Contact with us here: +306980984080</p>
            </div>
        </div>
    );
}

export default ContactPage;