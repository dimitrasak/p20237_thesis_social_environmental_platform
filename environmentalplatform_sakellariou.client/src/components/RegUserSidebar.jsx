import React, { useState, useEffect } from 'react';
import { Home, Users, BarChart, Settings, CalendarFold, MessageSquareHeart, MessagesSquare, CalendarSearch, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/Sidebars.css';

function RegUserSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [mobileVisible, setMobileVisible] = useState(false);

    const menuItems = [
        { name: 'Dashboard', icon: <Home />, path: '/reg-user-dashboard' },
        { name: 'Events', icon: <CalendarFold />, path: '/events' },        
        { name: 'Messages', icon: <MessagesSquare />, path: '/messages' },
        { name: 'Find people', icon: <Users />, path: '#' },
        { name: 'Reviews', icon: <MessageSquareHeart />, path: '/reviews' },
        { name: 'Settings', icon: <Settings />, path: '#' }
    ];

    const toggleSidebar = () => setCollapsed(prev => !prev);
    const toggleMobileSidebar = () => setMobileVisible(prev => !prev);

    // Detect window resize for mobile view
    useEffect(() => {
        const handleResize = () => {
            const isNowMobile = window.innerWidth <= 768;
            setIsMobile(isNowMobile);
            if (!isNowMobile) setMobileVisible(false); // Hide mobile sidebar when returning to desktop
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {/* Show toggle button only on mobile */}
            {isMobile && (
                <button
                    onClick={toggleMobileSidebar}
                    className="mobile-sidebar-toggle"
                    style={{
                        position: 'fixed',
                        top: '70px',
                        left: '10px',
                        zIndex: 2100,
                        background: '#fff',
                        border: '1px solid #ddd',
                        padding: '6px 10px',
                        borderRadius: '6px'
                    }}
                >
                    ☰
                </button>
            )}
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
        </>
    );
}

export default RegUserSidebar;
