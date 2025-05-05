import React, { useState, useEffect } from 'react';
import {
    Home, Users, BarChart, Settings, CalendarFold,
    MessageSquareHeart, MessagesSquare, CalendarSearch, ChevronLeft, ChevronRight
} from 'lucide-react';
import '../styles/Sidebars.css';

function OrganizationSidebar({ isMobile = false, mobileVisible = false }) {
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { name: 'Dashboard', icon: <Home />, path: '/organization-dashboard' },
        { name: 'Events', icon: <CalendarFold />, path: '/events' },
        { name: 'My Events', icon: <CalendarSearch />, path: '/organization-events' },
        { name: 'Messages', icon: <MessagesSquare />, path: '/messages' },
        { name: 'Find people', icon: <Users />, path: '#' },
        { name: 'Reviews', icon: <MessageSquareHeart />, path: '/reviews' },
        { name: 'Settings', icon: <Settings />, path: '#' }
    ];

    const toggleSidebar = () => setCollapsed(prev => !prev);

    return (
        <div
            className={`sidebar ${collapsed ? 'collapsed' : ''} ${isMobile && mobileVisible ? 'mobile-visible' : ''}`}
        >
            <div className="sidebar-header">
                <button className="toggle-button" onClick={toggleSidebar}>
                    {collapsed ? <ChevronRight /> : <ChevronLeft />}
                </button>
                {!collapsed && <span className="sidebar-title">Dashboard</span>}
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <a key={item.name} href={item.path} className="sidebar-link">
                        {item.icon}
                        {!collapsed && <span>{item.name}</span>}
                    </a>
                ))}
            </nav>
        </div>
    );
}


export default OrganizationSidebar;
