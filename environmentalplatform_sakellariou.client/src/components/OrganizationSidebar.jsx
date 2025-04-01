import React from 'react';
import { Home, Users, BarChart, Settings, CalendarFold, MessageSquareHeart, MessagesSquare, CalendarSearch } from 'lucide-react';
import '../styles/Sidebars.css';

function OrganizationSidebar() {
    const menuItems = [
        { name: 'Dashboard', icon: <Home />, path: '/organization-dashboard' },
        { name: 'Events', icon: <CalendarFold />, path: '/events' },
        { name: 'My Events', icon: <CalendarSearch />, path: '/organization-events' },
        { name: 'Messages', icon: <MessagesSquare />, path: '/messages' },
        { name: 'Find people', icon: <Users />, path: '#' },
        { name: 'Reviews', icon: <MessageSquareHeart />, path: '#' },
        { name: 'Settings', icon: <Settings />, path: '#' }
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">Org Dashboard</div>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <a
                        key={item.name}
                        href={item.path}
                        className="sidebar-link"
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </a>
                ))}
            </nav>
        </div>
    );
}

export default OrganizationSidebar;
