import React, { useState, useEffect } from 'react';
import {
    Home, Users, Settings, CalendarFold, MessageSquareHeart,
    MessagesSquare, ChevronLeft, ChevronRight
} from 'lucide-react';
import '../styles/Sidebars.css';
import { useNavigate } from 'react-router-dom';

function RegUserSidebar({ isMobile = false, mobileVisible = false }) {
    const [collapsed, setCollapsed] = useState(false);
    const [isActive, setIsActive] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            navigate('/login');
            return;
        }

        fetch(`https://localhost:7029/api/users/${userId}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch user');
                return res.json();
            })
            .then(user => {
                setIsActive(user.isActive);
            })
            .catch(err => {
                console.error(err);
                setIsActive(false);
            });
    }, [navigate]);

    const menuItemsActive = [
        { name: 'Dashboard', icon: <Home />, path: '/reg-user-dashboard' },
        { name: 'Events', icon: <CalendarFold />, path: '/events' },
        { name: 'Messages', icon: <MessagesSquare />, path: '/messages' },
        { name: 'Find people', icon: <Users />, path: '/users' },
        { name: 'Reviews', icon: <MessageSquareHeart />, path: '/reviews' },
        { name: 'Settings', icon: <Settings />, path: '/settings' }
    ];

    const menuItemsInactive = [
        { name: 'Settings', icon: <Settings />, path: '/settings' }
    ];

    const toggleSidebar = () => setCollapsed(prev => !prev);
    const toggleMobileSidebar = () => setMobileVisible(prev => !prev);

    useEffect(() => {
        const handleResize = () => {
            const isNowMobile = window.innerWidth <= 768;
            if (!isNowMobile) setMobileVisible(false);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isActive === null) {
        return <div className="sidebar">Loading...</div>;
    }

    const menuItems = isActive ? menuItemsActive : menuItemsInactive;

    return (
        <>
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

            <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${isMobile && mobileVisible ? 'mobile-visible' : ''}`}>
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
        </>
    );
}

export default RegUserSidebar;
