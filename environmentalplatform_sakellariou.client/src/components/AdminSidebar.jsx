import React from 'react';
import { Home, Users, Settings, MessageSquareWarning, MessagesSquare, CalendarCog } from 'lucide-react';
import '../styles/Sidebars.css';

function AdminSidebar() {
    const menuItems = [
        { name: 'Dashboard', icon: <Home />, path: '/admin-dashboard' },
        { name: 'Event Categories', icon: <CalendarCog />, path: '/categories' },
        { name: 'Users', icon: <Users />, path: '#' },
        { name: 'Reports', icon: <MessageSquareWarning />, path: '#' },
        { name: 'Messages', icon: <MessagesSquare />, path: '#' },        
        { name: 'Settings', icon: <Settings />, path: '#' }
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">Administration</div>
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

export default AdminSidebar;
