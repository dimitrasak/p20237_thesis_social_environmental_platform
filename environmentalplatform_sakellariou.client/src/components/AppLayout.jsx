// components/AppLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import OrganizationSidebar from './OrganizationSidebar';
import RegUserSidebar from './RegUserSidebar';
import AdminSidebar from './AdminSidebar';
import '../styles/AppLayout.css';

const AppLayout = () => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    const noSidebarRoutes = ['/', '/login', '/register', '/about', '/contact'];
    const showSidebar = token && !noSidebarRoutes.includes(location.pathname);

    const renderSidebar = () => {
        if (!showSidebar) return null;
        if (role === 'Organization') return <OrganizationSidebar />;
        if (role === 'Admin') return <AdminSidebar />;
        if (role === 'Regular User') return <RegUserSidebar />;
        return null;
    };

    return (
        <>
            
            <div className="layout-container">
                {showSidebar && <div className="sidebar-container">{renderSidebar()}</div>}
                <div className="content-container">
                    <Outlet />
                </div>
            </div>
        </>
    );
};

export default AppLayout;
